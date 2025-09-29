from typing import Dict, List, Optional
from urllib.parse import urljoin, quote
from datetime import datetime
from pathlib import Path
import pandas as pd
import numpy as np
import requests, warnings, json, io

from fastapi import APIRouter, HTTPException, Response
from fastapi.responses import JSONResponse
from pydantic import BaseModel

warnings.filterwarnings("ignore")


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

        self.base_url = "https://www.census.gov/naics/2022NAICS/"
        self.files = {
            "2_6_digit_codes": "2-6 digit_2022_Codes.xlsx",
            "descriptions": "2022_NAICS_Descriptions.xlsx",
            "structure": "2022_NAICS_Structure.xlsx",
            "cross_references": "2022_NAICS_Cross_References.xlsx",
        }
        self.cache_file = self.data_dir / "naics_lookups.json"
        # lambda function to right-pad NAICS codes with '0' to 6 digits
        self.zero_pad = lambda naics_code: str(naics_code).strip().ljust(6, "0")

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
            print(f"Writing new cache file: {self.cache_file}")
            with open(self.cache_file, "w") as f:
                json.dump(result, f, indent=2)
        except Exception as e:
            print(f"Warning: Failed to write to cache: {e}")
        return result

    def download_files(self) -> Dict[str, bool]:
        """Download only essential NAICS files for lookup generation"""
        results = {}
        for name, filename in self.files.items():
            file_path = self.data_dir / filename
            if file_path.exists():
                results[name] = True
                continue

            try:
                url = urljoin(self.base_url, quote(filename))
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
        """Load, process, and integrate all NAICS data"""
        desc_df = self._load_descriptions()  # core descriptions
        codes_df = self._load_2_6_digit_codes()  # 2-6 digit NAICS codes for validation
        structure_df = self._load_structure()  # detailed hierarchy and metadata
        cross_ref_data = self._load_cross_references()  # cross references for relationship mapping
        # merge all data sources
        df = self._merge_naics_data(desc_df, codes_df, structure_df, cross_ref_data)
        return df

    def _find_col(self, df: pd.DataFrame, matches: List[str], fallback_idx: int):
        """Return the first column whose name contains any of `matches` (case-insensitive)."""
        for m in matches:
            hits = [c for c in df.columns if m in c.lower()]
            if hits:
                return hits[0]
        if fallback_idx > len(df.columns):
            raise IndexError(f"Fallback index {fallback_idx} is out of bounds for DataFrame")
        return df.columns[fallback_idx]

    def _load_descriptions(self, file_key: str = "descriptions") -> pd.DataFrame:
        """
        Load the 2022_NAICS_Descriptions.xlsx sheet.\n
        cols: Code | Title | Description
        """
        filename = self.files[file_key]
        file_ = self.data_dir / filename
        if not file_.exists():
            raise FileNotFoundError(f"Descriptions file not found: {file_}")

        df = pd.read_excel(io=file_, dtype=str).rename(columns=str.lower)

        # find column header names
        code_col = self._find_col(df, ["code"], 0)
        title_col = self._find_col(df, ["title"], 1)
        desc_col = self._find_col(df, ["description"], 2)
        if not (code_col and title_col and desc_col):
            raise ValueError("Could not find required NAICS code, title, and description columns")

        # right-pad NAICS codes with '0' to 6 digits
        df[code_col] = df[code_col].apply(self.zero_pad)

        # strip trailing "T" from title
        title = df[title_col].fillna("").str.removesuffix("T").str.strip()
        # cleanup null descriptions
        description = (
            df[desc_col].fillna("").str.replace("NULL", "").str.replace(r"\s+", " ", regex=True).str.strip()
        )
        # combine title + description column text in a new description column
        df[desc_col] = np.where(
            description.ne(""),
            title + " - " + description,
            title,
        )

        # rename, cite, and return clean dataframe
        df[title_col] = title
        df = (
            df[[code_col, desc_col]]
            .rename(columns={code_col: "naics_code", title_col: "title", desc_col: "description"})
            .drop_duplicates(subset="naics_code")
            .reset_index(drop=True)
        )
        df["source"] = urljoin(self.base_url, quote(filename))

        print(f"{filename}: loaded {len(df)} records.")
        return df

    def _load_2_6_digit_codes(self, file_key: str = "2_6_digit_codes") -> pd.DataFrame:
        """
        Load 2-6 digit NAICS codes excel sheet.\n
        cols: Seq. No | 2022 NAICS US   Code | 2022 NAICS US Title
        """
        filename = self.files[file_key]
        file_ = self.data_dir / filename
        if not file_.exists():
            print("Warning: 2-6 digit codes file not found, skipping...")
            return pd.DataFrame()

        df = pd.read_excel(io=file_, dtype=str).rename(columns=str.lower)
        code_col = self._find_col(df, ["code"], 1)

        # right-pad NAICS codes with '0' to 6 digits
        df[code_col] = df[code_col].apply(self.zero_pad)

        df = df[[code_col]].rename(columns={code_col: "naics_code"}).dropna().drop_duplicates()
        df["source"] = urljoin(self.base_url, quote(filename))  # add source

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
        filename = self.files[file_key]
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
            df["source"] = urljoin(self.base_url, quote(filename))

            print(f"{filename}: loaded {len(df)} records.")
            return df
        except Exception as e:
            print(f"Error with NAICS structure file {filename}: {e}")

        return pd.DataFrame()

    def _load_cross_references(self, file_key: str = "cross_references"):
        """Load NAICS Industry Cross-References excel sheet to build relationship mapping\n
        cols: Code | Cross-Reference"""
        filename = self.files[file_key]
        file_ = self.data_dir / filename
        if not file_.exists():
            print("Warning: Cross-references file not found, skipping...")
            return {}

        try:
            df = pd.read_excel(file_, dtype=str).rename(columns=str.lower)
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

            exploded["source"] = urljoin(self.base_url, quote(filename))

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
        self, desc_df: pd.DataFrame, codes_df: pd.DataFrame, structure_df: pd.DataFrame, cross_refs: Dict
    ):
        """Merge all NAICS data sources into comprehensive dataset"""
        df = desc_df.copy()  # start with descriptions as base

        # add validation from codes file
        if not codes_df.empty:
            valid_codes = set(codes_df["naics_code"].tolist())
            df["validated"] = df["naics_code"].isin(valid_codes)
        else:
            df["validated"] = True

        # add structure info
        if not structure_df.empty and "naics_code" in structure_df.columns:
            structure_info = structure_df.drop_duplicates("naics_code")
            # merge creates title_x from desc_df and title_y from structure_df
            df = df.merge(structure_info, on="naics_code", how="outer", suffixes=("_desc", "_struct"))
            # description title first, structure title is fallback
            df["title"] = df["title_desc"].fillna(df["title_struct"])
            df = df.drop(columns=[col for col in df.columns if "_desc" in col or "_struct" in col])

            # extract change indicators if available
            change_cols = [
                col for col in structure_info.columns if "change" in col.lower() or "indicator" in col.lower()
            ]
            if change_cols:
                df["has_change_indicator"] = ~df[change_cols].isnull().all(axis=1)
            else:
                df["has_change_indicator"] = False

        # add hierarchy information
        df["level"] = df["naics_code"].str.len()
        df["sector"] = df["naics_code"].str[:2]
        df["subsector"] = df["naics_code"].apply(lambda x: x[:3] if len(x) >= 3 else None)
        df["industry_group"] = df["naics_code"].apply(lambda x: x[:4] if len(x) >= 4 else None)
        df["industry"] = df["naics_code"].apply(lambda x: x[:5] if len(x) >= 5 else None)

        # add cross-reference relationships
        df["related_codes"] = (
            df["naics_code"].map(cross_refs).fillna("").apply(lambda x: x if isinstance(x, list) else [])
        )
        df["has_cross_refs"] = df["related_codes"].apply(len) > 0
        df["cross_ref_count"] = df["related_codes"].apply(len)

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
        df["defense_related"] = desc_lower.apply(lambda x: any(keyword in x for keyword in defense_keywords))

        # count defense keywords for scoring
        df["defense_keyword_count"] = desc_lower.apply(
            lambda x: sum(1 for keyword in defense_keywords if keyword in x)
        )
        return df

    def generate_lookups(self, df: pd.DataFrame):
        """Generate comprehensive, aggregation of NAICS code records data"""
        naics_data = []
        for _, row in df.iterrows():
            naics_data.append({
                "code": row["naics_code"],
                "description": row["description"],
                "title": row.get("title", ""),
                "level": row["level"],
                "sector": row["sector"],
                "subsector": row["subsector"],
                "industry_group": row["industry_group"],
                "industry": row["industry"],
                "related_codes": row["related_codes"],
                "cross_ref_count": row["cross_ref_count"],
                "defense_related": row["defense_related"],
                "defense_keyword_count": row["defense_keyword_count"],
                "validated": row.get("validated", True),
                "change_indicator": row.get("change_indicator", None),
            })
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
            "defense_codes": df[df["defense_related"]]["naics_code"].tolist(),
            "codes_with_cross_refs": df[df["has_cross_refs"]]["naics_code"].tolist(),
            "high_defense_codes": df[df["defense_keyword_count"] >= 3]["naics_code"].tolist(),
        }
        metadata = {
            "total_codes": len(df),
            "defense_count": len(df[df["defense_related"]]),
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
    """Get comprehensive NAICS data, including lookups and optional visualizations."""
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
