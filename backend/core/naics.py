from typing import Dict, List, Optional
from datetime import datetime
from pathlib import Path
import pandas as pd
import numpy as np
import requests, warnings, json, io

from fastapi import APIRouter, HTTPException, Response
from fastapi.responses import JSONResponse
from pydantic import BaseModel

warnings.filterwarnings("ignore")


def extract_html_bullets(raw_html: str):
    if not isinstance(raw_html, str) or "<" not in raw_html.lower():
        return raw_html or ""
    import html, re
    from bs4 import BeautifulSoup

    raw_html = html.unescape(raw_html)
    soup = BeautifulSoup(raw_html, "html.parser")
    for br in soup.find_all("br"):
        br.replace_with("\n")
    dts = soup.find_all("dt")
    if not dts:  # nothing to extract
        return soup.get_text(" ", strip=True)
    bullets = []
    for dt in dts:
        line = dt.get_text("\n", strip=True)
        line = re.sub(r"\s+", " ", line).replace("\n", " ").rstrip(" ;")
        bullets.append(line)
    return "; ".join(bullets)


def zero_pad(code):
    if pd.isna(code):
        return None
    s = str(code).strip()
    return s.ljust(6, "0") if s.isdigit() else None


class NAICSResponse(BaseModel):
    success: bool
    message: str
    data: Optional[Dict] = None
    error: Optional[str] = None


class NAICSProcessor:
    def __init__(self):
        core_dir = Path(__file__).resolve().parent
        self.data_dir = core_dir / "data"
        self.data_dir.mkdir(parents=True, exist_ok=True)

        self.files = {
            "2_6_digit_codes": {
                "url": "https://www.census.gov/naics/2022NAICS/2-6%20digit_2022_Codes.xlsx",
                "filename": "2-6 digit_2022_Codes.xlsx",
            },
            "descriptions": {
                "url": "https://www.census.gov/naics/2022NAICS/2022_NAICS_Descriptions.xlsx",
                "filename": "2022_NAICS_Descriptions.xlsx",
            },
            "structure": {
                "url": "https://www.census.gov/naics/2022NAICS/2022_NAICS_Structure.xlsx",
                "filename": "2022_NAICS_Structure.xlsx",
            },
            "cross_references": {
                "url": "https://www.census.gov/naics/2022NAICS/2022_NAICS_Cross_References.xlsx",
                "filename": "2022_NAICS_Cross_References.xlsx",
            },
            "sba_size_standards": {
                "url": "https://data.sba.gov/dataset/c17e8870-fa85-48a4-8887-9a51b7503711/resource/2f56c7b6-715f-41f5-a470-2ee124af146a/download/sba-table-of-size-standards_effective-march-17-2023_v0.xlsx",
                "filename": "sba-table-of-size-standards_effective-march-17-2023_v0.xlsx",
            },
        }
        self.cache_file = self.data_dir / "naics_lookups.json"

        # cleanup functions
        self.zero_pad = zero_pad
        self.parse_html = extract_html_bullets

    def _to_native_py(self, obj):
        """Recursive util to convert NumPy/pandas types to native Python types."""
        if isinstance(obj, dict):
            return {key: self._to_native_py(value) for key, value in obj.items()}
        if isinstance(obj, list):
            return [self._to_native_py(item) for item in obj]
        if isinstance(obj, (np.integer,)):
            return int(obj)
        if isinstance(obj, (np.floating, np.float64)):
            return float(obj)
        if isinstance(obj, np.ndarray):
            return obj.tolist()
        if pd.isna(obj):
            return None
        return obj

    def _load_valid_cache(self) -> dict | None:
        """Loads data from the cache file if it exists, is valid, has not expired, and meets dataviz requirements."""
        if not self.cache_file.exists():
            return None
        try:
            with open(self.cache_file, "r") as f:
                cached_data = json.load(f)

            # dict type check
            if not isinstance(cached_data, dict):
                print("Cache is malformed. Reprocessing.")
                return None

            # expired check
            if datetime.now().timestamp() - cached_data.get("timestamp", 0) > 604800:
                print("Cache has expired. Reprocessing.")
                return None
            print("Returning valid data from cache.")
            return cached_data
        except (json.JSONDecodeError, FileNotFoundError):
            print("Cache is corrupted or missing. Reprocessing.")
            return None

    def process_and_cache(self) -> Dict:
        """Performs full data processing pipeline and caches the result."""
        download_status = self.download_files()
        if not all(download_status.values()):
            raise Exception(f"Failed to download files: {download_status}")

        df = self.load_naics_data()
        lookups = self.generate_lookups(df)

        # cache and return results
        result = {
            "lookups": lookups,
            "download_status": download_status,
            "timestamp": datetime.now().timestamp(),
            "expires_at": datetime.now().timestamp() + 604800,  # 7-day expiry
        }
        try:
            print(f"New cache file: {self.cache_file}")
            with open(self.cache_file, "w") as f:
                json.dump(result, f, indent=2)
        except Exception as e:
            print(f"Warning: Failed to write to cache: {e}")
        print("✔ Lookup map processing complete.")
        return result

    def download_files(self) -> Dict[str, bool]:
        """Download only essential NAICS files for lookup generation"""
        results = {}
        for name, file_info in self.files.items():
            url = file_info["url"]
            filename = file_info["filename"]
            file_path = self.data_dir / filename

            # check for existing copy
            if file_path.exists():
                results[name] = True
                continue
            try:  # download from source
                response = requests.get(url, timeout=30)
                response.raise_for_status()
                with open(file_path, "wb") as f:
                    f.write(response.content)
                results[name] = True
            except Exception as e:
                results[name] = False
                print(f"Failed to download {filename}: {e}")
        return results

    def load_naics_data(self):
        """Load, process, and merge all NAICS data"""
        desc_df = self._load_descriptions()  # core descriptions
        codes_df = self._load_2_6_digit_codes()  # 2-6 digit NAICS codes for validation
        structure_df = self._load_structure()  # detailed hierarchy and metadata
        cross_ref_data = self._load_cross_references()  # cross references for relationship mapping
        sba_df = self._load_sba_size_standards()

        df = self._merge_naics_data(desc_df, codes_df, structure_df, cross_ref_data, sba_df)
        return df

    def _find_col(self, df: pd.DataFrame, matches: List[str], fallback_idx: int):
        """Helper function to find first column whose name contains any of `matches` (case-insensitive)."""
        for m in matches:
            hits = [c for c in df.columns if m in c.lower()]
            if hits:
                return hits[0]
        if fallback_idx > len(df.columns):
            raise IndexError(f"Fallback index {fallback_idx} is out of bounds for DataFrame")
        return df.columns[fallback_idx]

    def _load_sba_size_standards(self, file_key: str = "sba_size_standards") -> pd.DataFrame:
        files_info = self.files[file_key]
        filename = files_info["filename"]
        file_path = self.data_dir / filename
        if not file_path.exists():
            print(f"Warning: SBA size standards file not found at {file_path}, skipping...")
            return pd.DataFrame()

        try:
            df = pd.read_excel(
                file_path,
                sheet_name="table_of_size_standards-all",  # we want the 2nd sheet
                header=0,  # headers are on first row
                dtype=str,
            ).rename(columns=str.lower)
            df.columns = [c.lower().replace("\n", " ").strip() for c in df.columns]

            code_col = self._find_col(df, ["naics codes"], 0)
            receipts_col = self._find_col(df, ["millions of dollars"], 2)
            employees_col = self._find_col(df, ["number of employees"], 3)

            # select relevant columns
            df = df[[code_col, receipts_col, employees_col]].copy()
            df.rename(columns={code_col: "naics_code"}, inplace=True)

            # filter out header rows by ensuring the row starts with a digit
            df = df[df["naics_code"].str.match(r"^\d", na=False)]

            # force to numeric to handle ".0" floats, coercing errors
            df["naics_code"] = pd.to_numeric(df["naics_code"], errors="coerce")

            # drop rows that are NaN
            df.dropna(subset=["naics_code"], inplace=True)

            # zero-pad codes to up to 6 digits
            df["naics_code"] = df["naics_code"].astype(np.int64).astype(str).apply(self.zero_pad)

            # convert size standard columns to numeric, coerce errors to NaN
            receipts = pd.to_numeric(df[receipts_col], errors="coerce")
            employees = pd.to_numeric(df[employees_col], errors="coerce")

            # determine size metric by selecting for the column with a valid number
            df["size_standard_metric"] = np.select(
                [receipts.notna(), employees.notna()],
                ["receipts", "employees"],
                default="",
            )

            # calculate max threshold, convert millions to dollars
            df["size_standard_max"] = np.where(
                df["size_standard_metric"] == "receipts",
                receipts * 1_000_000,
                employees,
            )
            # drop any unresolved rows
            df.dropna(subset=["size_standard_max", "size_standard_metric"], inplace=True)
            # convert max threshold to 64-bit int (bigint) for database compatibility
            df["size_standard_max"] = df["size_standard_max"].astype(np.int64)

            # prepare and return final, clean dataframe
            final_df = (
                df[["naics_code", "size_standard_metric", "size_standard_max"]]
                .drop_duplicates("naics_code")
                .reset_index(drop=True)
            )
            print(f"{filename}: processed {len(final_df)} size standards.")
            return final_df
        except Exception as e:
            print(f"Error processing SBA size standards file {filename}: {e}")
            return pd.DataFrame()

    def _load_descriptions(self, file_key: str = "descriptions") -> pd.DataFrame:
        """
        Load and process the 2022_NAICS_Descriptions.xlsx dataset.\n
        cols: Code | Title | Description
        """
        meta = self.files[file_key]
        path_ = self.data_dir / meta["filename"]
        if not path_.exists():
            raise FileNotFoundError(f"Descriptions file not found: {path_}")

        df = pd.read_excel(io=path_, dtype=str).rename(columns=str.lower)

        # find columns
        c_code = self._find_col(df, ["code"], 0)
        c_title = self._find_col(df, ["title"], 1)
        c_desc = self._find_col(df, ["description"], 2)
        if not all([c_code, c_title, c_desc]):
            raise ValueError("Required columns missing")

        src = (
            df[[c_code, c_title, c_desc]]
            .rename(columns={c_code: "raw_code", c_title: "title", c_desc: "description"})
            .fillna("")
            .assign(
                raw_code=lambda d: d.raw_code.str.strip(),
                trilateral=lambda d: d.title.str.endswith("T"),
                title_clean=lambda d: d.title.str.rstrip("T").str.strip(),
                desc_clean=(
                    lambda d: (
                        d.description.str.replace("NULL", "", regex=False)
                        .str.replace(r"\n{2,}", "\n", regex=True)  # single new lines
                        .str.replace(r"[ \t\r\f\v]+", " ", regex=True)  # single spaces
                        .str.strip()
                    )
                ),
            )
        )

        redirect_re = r"(?i)^see\s+industry\s+description\s+for\s+(\d{5,6})\.?$"
        is_redirect = src.desc_clean.str.fullmatch(redirect_re)
        src = src.loc[~is_redirect].copy()

        hyphen_mask = src.raw_code.str.fullmatch(r"\d{2}-\d{2}")
        hyphen_rows = (
            src.loc[hyphen_mask]
            .assign(
                code_str=lambda d: d.raw_code.str.split("-").apply(
                    lambda ab: [f"{i}" for i in range(int(ab[0]), int(ab[1]) + 1)]
                )
            )
            .explode("code_str", ignore_index=True)
        )
        rows = src.loc[~hyphen_mask].assign(
            code_str=lambda d: d.raw_code.str.extract(r"(\d{2,6})", expand=False)
        )
        data = pd.concat([hyphen_rows, rows], ignore_index=True, copy=False)
        data = data[data.code_str.notna()]

        LEVEL_MAP = {
            2: "sector",
            3: "subsector",
            4: "industry_group",
            5: "naics_industry",
            6: "national_industry",
        }

        data = data.assign(
            naics_code=lambda d: d.code_str.apply(self.zero_pad),
            level=lambda d: d.code_str.str.len().map(LEVEL_MAP).fillna("unknown"),
        )
        result = (
            data[["naics_code", "title_clean", "desc_clean", "trilateral", "level"]]
            .rename(columns={"title_clean": "title", "desc_clean": "description"})
            .assign(source=meta["url"])
            .drop_duplicates(subset="naics_code", keep="first")
            .reset_index(drop=True)
        )
        print(f"{meta['filename']}: loaded {len(result)} records.")
        return result

    def _load_2_6_digit_codes(self, file_key: str = "2_6_digit_codes") -> pd.DataFrame:
        """
        Load 2-6 digit NAICS codes excel sheet.\n
        cols: Seq. No | 2022 NAICS US   Code | 2022 NAICS US Title
        """
        files_ = self.files[file_key]
        filename = files_["filename"]
        url = files_["url"]
        file_path = self.data_dir / filename
        if not file_path.exists():
            print("Warning: 2-6 digit codes file not found, skipping...")
            return pd.DataFrame()
        df = pd.read_excel(io=file_path, dtype=str).rename(columns=str.lower)
        code_col = self._find_col(df, ["code"], 1)

        # right-pad NAICS codes with '0' to 6 digits
        df[code_col] = df[code_col].apply(self.zero_pad)

        df = df[[code_col]].rename(columns={code_col: "naics_code"}).dropna().drop_duplicates()
        df["source"] = url  # add source

        print(f"{filename}: loaded {len(df)} records.")
        return df

    def _load_structure(self, file_key: str = "structure") -> pd.DataFrame:
        """Load NAICS structure for detailed hierarchy and change indicators

        Columns:
            - naics_code: The NAICS code, padded to 6 digits.
            - title: The official title for the NAICS code.
            - change_indicator: An indicator for changes (e.g., 'C' for changed).
            - sequence_number: The original sequence number for sorting.
            - source: The URL of the source file.
        """
        files_ = self.files[file_key]
        filename = files_["filename"]
        url = files_["url"]
        file_path = self.data_dir / filename
        if not file_path.exists():
            print(f"Warning: Structure file not found at {file_path}, skipping...")
            return pd.DataFrame()
        try:
            df = pd.read_excel(
                file_path,
                dtype=str,
                header=2,  # header in row idx 2
            ).rename(columns=str.lower)

            # find column header names
            code_col = self._find_col(df, ["code"], 1)
            title_col = self._find_col(df, ["title"], 2)
            change_col = self._find_col(df, ["change", "indicator"], 0)

            # right-pad NAICS codes with '0' to 6 digits
            df[code_col] = df[code_col].apply(self.zero_pad)

            # strip trailing "T" and whitespace from title
            df[title_col] = df[title_col].fillna("").str.removesuffix("T").str.strip()

            # rename, cite, and return clean dataframe
            df = (
                df[[code_col, title_col, change_col]]
                .rename(
                    columns={
                        code_col: "naics_code",
                        title_col: "title",
                        change_col: "change_indicator",
                    }
                )
                .drop_duplicates(subset="naics_code")
                .reset_index(drop=True)
            )
            df["source"] = url

            print(f"{filename}: loaded {len(df)} records.")
            return df
        except Exception as e:
            print(f"Error with NAICS structure file {filename}: {e}")

        return pd.DataFrame()

    def _load_cross_references(self, file_key: str = "cross_references"):
        """Load NAICS Industry Cross-References excel sheet to build relationship mapping\n
        cols: Code | Cross-Reference"""
        files_ = self.files[file_key]
        filename = files_["filename"]
        url = files_["url"]
        file_path = self.data_dir / filename
        if not file_path.exists():
            print("Warning: Cross-references file not found, skipping...")
            return {}

        try:
            df = pd.read_excel(file_path, dtype=str).rename(columns=str.lower)
            # find code and cross-reference column names
            code_col = self._find_col(df, ["code"], 0)
            ref_text = self._find_col(df, ["cross", "refer"], 1)

            # create new header with right-padded NAICS codes
            df["naics_code"] = df[code_col].apply(self.zero_pad)

            # extract all potential NAICS (4-6 digit) codes from reference text
            naics_regex = r"\b(\d{4,6})\b"
            exploded = (
                df.assign(ref_code=df[ref_text].str.extractall(naics_regex)[0].groupby(level=0).apply(list))
                .explode("ref_code")  # explode dataframe to expand each cross-ref pair into separate rows
                .dropna(subset=["ref_code"])
            )
            # right-pad NAICS codes with '0' to 6 digits
            exploded["ref_code"] = exploded["ref_code"].apply(self.zero_pad)
            # add cross-reference text
            exploded["ref_text"] = exploded[ref_text].str.strip()

            exploded = exploded[["naics_code", "ref_code", "ref_text"]]

            mapping = (
                exploded.groupby("naics_code")["ref_code"]
                .aggregate(
                    lambda refs: sorted(
                        # filter out self-loops (self-refs) for more meaningful adjacency lists later
                        set(code for code in refs if code != refs.name),
                    )
                )
                .to_dict()
            )
            exploded["source"] = url

            # TODO: expose dataframe for analysis (degrees, clusters, etc)?
            # self.cross_ref_df = exploded.reset_index(drop=True)

            print(
                f"{filename}: extracted {len(mapping):,} naics codes with {len(exploded):,} total references."
            )
            return mapping
        except Exception as e:
            print(f"Warning: Could not load cross-references: {e}")
        return {}

    def _merge_naics_data(
        self,
        descript_df: pd.DataFrame,
        codes_df: pd.DataFrame,
        structure_df: pd.DataFrame,
        cross_refs: Dict[str, list],
        sba_df: pd.DataFrame,
    ):
        """Merge all NAICS data sources into comprehensive dataset"""
        df = descript_df.copy()  # start with descriptions as base

        # validation from codes
        if not codes_df.empty:
            valid_codes = set(codes_df["naics_code"].tolist())
            df["validated"] = df["naics_code"].isin(valid_codes)
        else:
            df["validated"] = True

        # structure info
        if not structure_df.empty and "naics_code" in structure_df.columns:
            struct = structure_df.drop_duplicates("naics_code")
            # merge creates title_x from descript_df and title_y from structure_df
            df = df.merge(
                struct,
                on="naics_code",
                how="left",
                suffixes=("_desc", "_struct"),
            )
            # description title first, structure title is fallback
            df["title"] = df["title_desc"].fillna(df["title_struct"])

            df = df.drop(columns=[col for col in df.columns if "_desc" in col or "_struct" in col])
            # extract change indicators if available
            change_cols = [
                col for col in struct.columns if "change" in col.lower() or "indicator" in col.lower()
            ]
            df["has_change_indicator"] = False if not change_cols else ~df[change_cols].isna().all(axis=1)

        # SBA size standards
        if not sba_df.empty:
            df = df.merge(sba_df, on="naics_code", how="left")
        else:
            df[["size_standard_metric", "size_standard_max"]] = None

        # sector info
        df["sector"] = df["naics_code"].str.rstrip("0").str[:2]

        # cross-reference info
        df["related_codes"] = (
            df["naics_code"].map(cross_refs).apply(lambda x: x if isinstance(x, list) else [])
        )
        df["cross_ref_count"] = df["related_codes"].str.len()
        df["has_cross_refs"] = df["cross_ref_count"] > 0

        # add defense analysis with enhanced keywords
        defense_keywords = [
            "defense",
            "military",
            "aerospace",
            "aircraft",
            "missile",
            "radar",
            "cybersecurity",
            "security",
            "intelligence",
            "surveillance",
            "communication",
            "electronics",
            "computer",
            "software",
            "systems",
            "research",
            "development",
            "engineering",
            "consulting",
            "professional",
            "weapons",
            "ammunition",
            "naval",
            "marine",
            "aviation",
            "space",
            "technology",
            "manufacturing",
            "testing",
            "training",
            "logistics",
            "maintenance",
            "repair",
            "support",
            "services",
        ]
        desc_lower = df["description"].fillna("").str.lower()
        df["defense_keyword_count"] = desc_lower.apply(lambda txt: sum(k in txt for k in defense_keywords))
        df["defense_related"] = df["defense_keyword_count"] > 0

        return df

    def generate_lookups(self, df: pd.DataFrame):
        """Generate comprehensive, aggregation of NAICS code data as Python-native, lookup dictionary."""
        naics_data = [
            {
                "code": row["naics_code"],
                "title": row.get("title", ""),
                "description": row["description"],
                "level": row["level"],
                "sector": row["sector"],
                "trilateral": row.get("trilateral", False),
                "size_standard_metric": row.get("size_standard_metric"),
                "size_standard_max": row.get("size_standard_max"),
                "related_codes": row["related_codes"],
                "cross_ref_count": row["cross_ref_count"],
                "defense_related": row["defense_related"],
                "defense_keyword_count": row["defense_keyword_count"],
                "validated": row.get("validated", True),
                "change_indicator": row.get("change_indicator", None),
                "source": row.get("source", None),
            }
            for _, row in df.iterrows()
        ]

        # industry sector info with enhanced labels
        sectors = {
            "11": "Agriculture, Forestry, Fishing and Hunting",
            "21": "Mining, Quarrying, and Oil and Gas Extraction",
            "22": "Utilities",
            "23": "Construction",
            "31": "Manufacturing",
            "32": "Manufacturing",
            "33": "Manufacturing",
            "42": "Wholesale Trade",
            "44": "Retail Trade",
            "45": "Retail Trade",
            "48": "Transportation and Warehousing",
            "49": "Transportation and Warehousing",
            "51": "Information",
            "52": "Finance and Insurance",
            "53": "Real Estate and Rental and Leasing",
            "54": "Professional, Scientific, and Technical Services",
            "55": "Management of Companies and Enterprises",
            "56": "Administrative and Support and Waste Management Services",
            "61": "Educational Services",
            "62": "Health Care and Social Assistance",
            "71": "Arts, Entertainment, and Recreation",
            "72": "Accommodation and Food Services",
            "81": "Other Services (except Public Administration)",
            "92": "Public Administration",
        }
        # some lightweight indexes for faster filtering
        indexes = {
            "defense_codes": df.loc[df["defense_related"], "naics_code"].tolist(),
            "codes_with_cross_refs": df.loc[df["has_cross_refs"], "naics_code"].tolist(),
            "high_defense_codes": df.loc[df["defense_keyword_count"] >= 3, "naics_code"].tolist(),
        }
        metadata = {
            "total_codes": int(len(df)),
            "defense_count": int(df["defense_related"].sum()),
            "avg_cross_refs": float(df["cross_ref_count"].mean()),
            "sectors": sectors,
            "processed_at": datetime.now().isoformat(),
        }

        return self._to_native_py({
            "naics": naics_data,  # array of complete objects
            "indexes": indexes,  # fast lookup arrays
            "metadata": metadata,  # summary stats
            "relationship_analysis": self._analyze_cross_ref_networks(df),
        })

    def _analyze_cross_ref_networks(self, df: pd.DataFrame) -> Dict:
        """Analyze cross-reference networks for strategic insights"""
        # find most connected codes (potential hub industries)
        top_connected = df.nlargest(10, "cross_ref_count")[
            ["naics_code", "description", "cross_ref_count", "defense_related"]
        ].to_dict("records")

        # find sectors with highest cross-ref density
        sector_cross_refs = (
            df.groupby("sector")
            .agg({"cross_ref_count": ["mean", "sum", "count"], "defense_related": "sum"})
            .round(2)
        )

        sector_analysis = []
        for sector in sector_cross_refs.index:
            sector_analysis.append({
                "sector": sector,
                "avg_cross_refs": sector_cross_refs.loc[sector, ("cross_ref_count", "mean")],
                "total_cross_refs": sector_cross_refs.loc[sector, ("cross_ref_count", "sum")],
                "code_count": sector_cross_refs.loc[sector, ("cross_ref_count", "count")],
                "defense_codes": sector_cross_refs.loc[sector, ("defense_related", "sum")],
            })

        # sort by cross-ref density
        sector_analysis = sorted(sector_analysis, key=lambda x: x["avg_cross_refs"], reverse=True)

        # find potential partnership clusters
        defense_clusters = (
            df[df["defense_related"]]
            .groupby("sector")
            .agg({"naics_code": "count", "cross_ref_count": "mean"})
            .sort_values("cross_ref_count", ascending=False)
            .head(5)
            .to_dict("index")
        )

        return {
            "most_connected_codes": top_connected,
            "sector_connectivity": sector_analysis[:15],  # Top 15 most connected sectors
            "defense_partnership_clusters": defense_clusters,
            "network_stats": {
                "total_relationships": df["cross_ref_count"].sum(),
                "avg_connections_per_code": df["cross_ref_count"].mean(),
                "max_connections": df["cross_ref_count"].max(),
                "codes_with_no_refs": len(df[df["cross_ref_count"] == 0]),
            },
        }


_processor = None  # global processor instance


def get_processor() -> NAICSProcessor:
    """Get or create global processor instance"""
    global _processor
    if _processor is None:
        _processor = NAICSProcessor()
    return _processor


router = APIRouter(tags=["naics"])


@router.get("/naics/codes")
async def get_naics_codes(
    defense_only: bool = False,
    sector: Optional[str] = None,
    min_cross_refs: int = 0,
):
    """Get array of NAICS code objects with optional filters"""
    try:
        processor = get_processor()
        if not processor.cache_file.exists():
            raise HTTPException(status_code=404, detail="NAICS data not processed yet")

        with open(processor.cache_file, "r") as f:
            data = json.load(f)

        codes = data.get("lookups", {}).get("codes", [])

        if defense_only:
            codes = [c for c in codes if c.get("defense_related")]
        if sector:
            codes = [c for c in codes if c.get("sector") == sector]
        if min_cross_refs > 0:
            codes = [c for c in codes if c.get("cross_ref_count", 0) >= min_cross_refs]

        return JSONResponse(content={"codes": codes, "count": len(codes)})
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/naics/codes/{naics_code}")
async def get_naics_code_detail(naics_code: str):
    """Get single NAICS code with full details"""
    try:
        processor = get_processor()
        if not processor.cache_file.exists():
            raise HTTPException(status_code=404, detail="NAICS data not processed yet")

        with open(processor.cache_file, "r") as f:
            data = json.load(f)

        codes = data.get("lookups", {}).get("codes", [])
        code_data = next((c for c in codes if c["code"] == naics_code), None)

        if not code_data:
            raise HTTPException(status_code=404, detail=f"NAICS code {naics_code} not found")
        return JSONResponse(content=code_data)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/naics/data")
async def get_naics_data(force_refresh: bool = False):
    """Get comprehensive NAICS data aggregated in a lookup map."""
    try:
        processor = get_processor()
        data = None if force_refresh else processor._load_valid_cache()

        if data is None:
            data = processor.process_and_cache()

        return NAICSResponse(
            success=True,
            message="NAICS data retrieved",
            data=data,
        )
    except Exception as e:
        import traceback

        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")


@router.get("/stats")
async def get_naics_stats():
    """Get NAICS processing statistics"""
    try:
        processor = get_processor()
        if not processor.cache_file.exists():
            raise HTTPException(status_code=404, detail="NAICS data not processed yet. Call /process first.")
        with open(processor.cache_file, "r") as f:
            data = json.load(f)

        return JSONResponse(content=data.get("lookups", {}).get("stats", {}))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get stats: {str(e)}")


@router.get("/relationships/{naics_code}")
async def get_naics_relationships(naics_code: str):
    """Get cross-reference relationships for a specific NAICS code"""
    try:
        processor = get_processor()
        if not processor.cache_file.exists():
            raise HTTPException(status_code=404, detail="NAICS data not processed yet")

        with open(processor.cache_file, "r") as f:
            data = json.load(f)

        lookups = data.get("lookups", {})
        cross_refs = lookups.get("cross_references", {})
        code_to_desc = lookups.get("code_to_description", {})

        if naics_code not in cross_refs:
            return JSONResponse(
                content={
                    "naics_code": naics_code,
                    "description": code_to_desc.get(naics_code, "Unknown"),
                    "related_codes": [],
                    "message": "No cross-references found for this code",
                }
            )

        # get related codes with descriptions
        related_codes = cross_refs[naics_code]
        relationships = []

        for code in related_codes:
            relationships.append({
                "naics_code": code,
                "description": code_to_desc.get(code, "Description not available"),
            })
        return JSONResponse(
            content={
                "naics_code": naics_code,
                "description": code_to_desc.get(naics_code, "Unknown"),
                "related_codes": relationships,
                "relationship_count": len(relationships),
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get relationships: {str(e)}")


@router.get("/network-analysis")
async def get_network_analysis():
    """Get cross-reference network analysis for strategic insights"""
    try:
        processor = get_processor()

        if not processor.cache_file.exists():
            raise HTTPException(status_code=404, detail="NAICS data not processed yet")

        with open(processor.cache_file, "r") as f:
            data = json.load(f)

        relationship_analysis = data.get("lookups", {}).get("relationship_analysis", {})

        if not relationship_analysis:
            raise HTTPException(status_code=404, detail="No relationship analysis available")

        return JSONResponse(content=relationship_analysis)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get network analysis: {str(e)}")


@router.post("/search-naics")
async def get_naics_term(term: str):
    """Search NAICS codes by description keyword"""
    try:
        processor = get_processor()

        if not processor.cache_file.exists():
            raise HTTPException(status_code=404, detail="NAICS data not processed yet")

        with open(processor.cache_file, "r") as f:
            data = json.load(f)

        lookups = data.get("lookups", {})
        code_to_desc = lookups.get("code_to_description", {})
        cross_refs = lookups.get("cross_references", {})

        # enhanced search implementation
        matches = {}
        related_matches = {}
        search_term = term.lower()

        # direct description search
        for code, description in code_to_desc.items():
            if search_term in description.lower():
                matches[code] = {
                    "description": description,
                    "match_type": "direct",
                    "related_codes": cross_refs.get(code, []),
                }

        # cross reference search - find codes related to matches
        for matched_code in matches.keys():
            for code, related_codes in cross_refs.items():
                if matched_code in related_codes and code not in matches:
                    related_matches[code] = {
                        "description": code_to_desc.get(code, "Unknown"),
                        "match_type": "related",
                        "related_via": matched_code,
                    }

        return JSONResponse(
            content={
                "search_term": term,
                "direct_matches": matches,
                "related_matches": related_matches,
                "total_matches": len(matches) + len(related_matches),
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")


@router.get("/export/{format}")
async def export_naics_data(format: str):
    """Export comprehensive NAICS data in CSV or JSON format"""
    try:
        processor = get_processor()

        if not processor.cache_file.exists():
            raise HTTPException(status_code=404, detail="NAICS data not processed yet")

        with open(processor.cache_file, "r") as f:
            data = json.load(f)

        lookups = data.get("lookups", {})

        if format.lower() == "json":
            return JSONResponse(content=lookups)

        elif format.lower() == "csv":
            # convert to comprehensive CSV format
            code_to_desc = lookups.get("code_to_description", {})
            code_to_sector = lookups.get("code_to_sector", {})
            cross_refs = lookups.get("cross_references", {})
            defense_codes = set(lookups.get("defense_codes", []))

            rows = []
            for code, description in code_to_desc.items():
                related_codes = cross_refs.get(code, [])
                rows.append({
                    "naics_code": code,
                    "description": description,
                    "sector": code_to_sector.get(code, ""),
                    "level": len(code),
                    "defense_related": code in defense_codes,
                    "cross_reference_count": len(related_codes),
                    "related_codes": "|".join(related_codes) if related_codes else "",
                })

            df = pd.DataFrame(rows)
            csv_buffer = io.StringIO()
            df.to_csv(csv_buffer, index=False)

            return Response(
                content=csv_buffer.getvalue(),
                media_type="text/csv",
                headers={"Content-Disposition": "attachment; filename=comprehensive_naics_data.csv"},
            )

        else:
            raise HTTPException(status_code=400, detail="Format must be 'json' or 'csv'")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Export failed: {str(e)}")
