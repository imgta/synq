from typing import Dict
from matplotlib.figure import Figure
import seaborn as sns
import pandas as pd
import base64, io

sns.set_theme(style="whitegrid", palette="viridis")

def generate_dataviz(df: pd.DataFrame) -> Dict[str, str]:
    """Return base64-encoded PNGs keyed by plot name, using seaborn."""
    plots: Dict[str, str] = {}

    # opportunity heatmap
    fig_heat = Figure(figsize=(14, 10))
    ax_heat = fig_heat.subplots()

    pivot = df.pivot_table(
        values="jv_potential",
        index="sector",
        columns="level",
        aggfunc="mean",
        fill_value=0,
    )
    sns.heatmap(
        pivot,
        annot=True,
        fmt=".3f",
        cmap="RdYlBu_r",
        cbar_kws={"label": "Joint Venture Potential Score"},
        linewidths=0.5,
        ax=ax_heat,
    )
    ax_heat.set_title(
        "Defense Contracting Opportunity Matrix\n(JV Potential by Sector & NAICS Level)",
        fontsize=14,
        fontweight="bold",
        pad=20,
    )
    ax_heat.set_xlabel("NAICS Hierarchy Level (Digits)")
    ax_heat.set_ylabel("Sector Code")

    sector_labels = {
        "11": "Agriculture",
        "21": "Mining",
        "22": "Utilities",
        "23": "Construction",
        "31": "Manufacturing",
        "32": "Manufacturing",
        "33": "Manufacturing",
        "42": "Wholesale",
        "44": "Retail",
        "45": "Retail",
        "48": "Transportation",
        "49": "Transportation",
        "51": "Information",
        "52": "Finance",
        "53": "Real Estate",
        "54": "Professional",
        "55": "Management",
        "56": "Admin Support",
        "61": "Education",
        "62": "Healthcare",
        "71": "Arts/Entertainment",
        "72": "Accommodation",
        "81": "Other Services",
        "92": "Public Admin",
    }
    ax_heat.set_yticklabels(
        [
            f"{lab.get_text()}-{sector_labels.get(lab.get_text(), 'Unknown')}"
            for lab in ax_heat.get_yticklabels()
        ],
        rotation=0,
    )
    fig_heat.tight_layout()
    plots["opportunity_heatmap"] = _fig_to_base64(fig_heat)

    # 4-panel dashboard
    fig_dash = Figure(figsize=(16, 12))
    axs = fig_dash.subplots(2, 2)
    fig_dash.suptitle("NAICS Defense Contracting Analysis Dashboard", fontsize=16, fontweight="bold")
    ax1, ax2, ax3, ax4 = axs.flatten()

    # subplot 1
    plot1 = df.groupby(["level", "defense_related"]).size().reset_index(name="count")
    sns.barplot(
        data=plot1,
        x="level",
        y="count",
        hue="defense_related",
        palette=["lightcoral", "steelblue"],
        dodge=False,
        errorbar=None,
        ax=ax1,
    )
    ax1.set_title("Defense vs Commercial Distribution by NAICS Level")
    ax1.set_xlabel("NAICS Level (Specificity)")
    ax1.set_ylabel("Number of Codes")
    ax1.legend(title=None, labels=["Commercial", "Defense-Related"])

    # subplot 2
    defense_sectors = (
        df[df["defense_related"]]
        .groupby("sector")
        .agg(
            naics_code=("naics_code", "count"),
            jv_potential=("jv_potential", "mean"),
        )
        .sort_values("naics_code", ascending=False)
        .head(10)
    )
    defense_sectors["proportion"] = defense_sectors["naics_code"] / defense_sectors["naics_code"].sum()
    hue_min, hue_max = defense_sectors["jv_potential"].min(), defense_sectors["jv_potential"].max()

    sns.barplot(
        data=defense_sectors.reset_index(),
        x="sector",
        y="naics_code",
        palette="viridis",
        hue_norm=(hue_min, hue_max),
        dodge=False,
        errorbar=None,
        ax=ax2,
    )
    ax2.set_title("Top 10 Defense Sectors")
    ax2.set_xlabel("Sector Code")
    ax2.set_ylabel("Proportion of Defense Codes")
    ax2.legend(title="Avg JV Potential", bbox_to_anchor=(1.02, 1), loc="upper left")

    # subplot 3
    sns.scatterplot(
        data=df,
        x="complexity_score",
        y="jv_potential",
        hue="defense_keyword_count",
        size="defense_keyword_count",
        sizes=(20, 200),
        palette="plasma",
        alpha=0.6,
        ax=ax3,
    )
    sns.regplot(
        data=df,
        x="complexity_score",
        y="jv_potential",
        scatter=False,
        color="r",
        line_kws={"linestyle": "--"},
        ax=ax3,
    )
    ax3.set_title("Complexity vs JV Potential\n(Size/Color = Defense Keywords)")
    ax3.set_xlabel("Complexity Score")
    ax3.set_ylabel("Joint Venture Potential")
    ax3.legend(title="Defense Keywords")

    # subplot 4
    hv = (
        df[
            (df["jv_potential"] > df["jv_potential"].quantile(0.8))
            & (df["complexity_score"] > df["complexity_score"].quantile(0.7))
        ]
        .groupby("sector")["naics_code"]
        .count()
        .head(8)
    )
    sns.barplot(x=hv.index, y=hv.values, palette="Set3", errorbar=None, ax=ax4)
    ax4.set_title("High-Value Opportunity Sectors\n(Top 80% JV Potential + Top 70% Complexity)")
    ax4.set_xlabel("Sector")
    ax4.set_ylabel("Count of High-Value NAICS Codes")

    fig_dash.tight_layout()
    plots["dashboard"] = _fig_to_base64(fig_dash)

    # keyword analysis feature
    fig_kw = Figure(figsize=(16, 8))
    ax_kw1, ax_kw2 = fig_kw.subplots(1, 2)

    defense_df = df[df["defense_related"]].copy()
    kw = (
        defense_df.groupby("defense_keyword_count")
        .agg(
            naics_code=("naics_code", "count"),
            jv_potential=("jv_potential", "mean"),
            complexity_score=("complexity_score", "mean"),
        )
        .reset_index()
    )
    sns.scatterplot(
        data=kw,
        x="defense_keyword_count",
        y="complexity_score",
        size="naics_code",
        hue="jv_potential",
        sizes=(50, 2500),
        palette="coolwarm",
        edgecolor="black",
        linewidth=1,
        alpha=0.7,
        ax=ax_kw1,
    )
    ax_kw1.set_title("Defense Keyword Impact Analysis\n(Bubble = Code Count, Color = JV Potential)")
    ax_kw1.set_xlabel("Defense Keywords Count")
    ax_kw1.set_ylabel("Average Complexity Score")
    ax_kw1.grid(True, alpha=0.3)
    ax_kw1.legend(title="JV Potential", bbox_to_anchor=(1.05, 1), loc="upper left")

    sector_special = df.groupby("sector").agg(
        defense_related=("defense_related", "sum"),
        naics_code=("naics_code", "count"),
        jv_potential=("jv_potential", "mean"),
    )
    sector_special["defense_ratio"] = sector_special["defense_related"] / sector_special["naics_code"]
    meaningful = sector_special[(sector_special["naics_code"] >= 5) & (sector_special["defense_ratio"] > 0)]
    meaningful = meaningful.sort_values("defense_ratio", ascending=False).head(12)
    sns.barplot(
        y=[f"Sector {s}" for s in meaningful.index],
        x=meaningful["defense_ratio"],
        hue=meaningful["jv_potential"],
        palette="viridis",
        dodge=False,
        errorbar=None,
        ax=ax_kw2,
    )
    ax_kw2.set_xlabel("Defense Specialisation Ratio")
    ax_kw2.set_ylabel("Sector")
    ax_kw2.set_title("Sector Defense Specialisation\n(Color = Avg JV Potential)")
    ax_kw2.grid(True, alpha=0.3, axis="x")
    ax_kw2.get_legend().remove()

    fig_kw.tight_layout()
    plots["keyword_analysis"] = _fig_to_base64(fig_kw)

    # strategic partnership analysis
    fig_spm = Figure(figsize=(16, 12))
    sp_axes = fig_spm.subplots(2, 2)
    fig_spm.suptitle("Strategic Partnership & Market Intelligence Dashboard", fontsize=16, fontweight="bold")
    sp1, sp2, sp3, sp4 = sp_axes.flatten()

    lvl = df.groupby("level").agg(
        complexity_score=("complexity_score", "mean"), jv_potential=("jv_potential", "mean")
    )
    sns.lineplot(
        data=lvl,
        x=lvl.index,
        y="complexity_score",
        marker="o",
        linewidth=3,
        markersize=8,
        color="darkblue",
        label="Complexity",
        ax=sp1,
    )
    sp1.set_ylabel("Complexity Score", color="darkblue")
    sp1_twin = sp1.twinx()
    sns.lineplot(
        data=lvl,
        x=lvl.index,
        y="jv_potential",
        marker="s",
        linewidth=3,
        markersize=8,
        color="darkred",
        label="JV Potential",
        ax=sp1_twin,
    )
    sp1_twin.set_ylabel("JV Potential Score", color="darkred")
    sp1.set_title("Complexity vs JV Potential by NAICS Level")
    sp1.grid(True, alpha=0.3)

    market = (
        df.groupby("sector")
        .agg(naics_code=("naics_code", "count"), jv_potential=("jv_potential", "mean"))
        .nlargest(15, "naics_code")
    )
    sns.barplot(
        x=[f"Sec {i}" for i in market.index],
        y=market["naics_code"],
        hue=market["jv_potential"],
        palette="plasma",
        dodge=False,
        errorbar=None,
        ax=sp2,
    )
    sp2.set_xticklabels(sp2.get_xticklabels(), rotation=45, ha="right")
    sp2.set_ylabel("Total NAICS Codes (Market Size)")
    sp2.set_xlabel("Sector")
    sp2.set_title("Market Size by Sector\n(Color = JV Potential)")
    sp2.get_legend().remove()

    df_tmp = df.copy()
    df_tmp["opportunity_score"] = (
        df_tmp["jv_potential"] * df_tmp["complexity_score"] * df_tmp["defense_keyword_count"]
    )
    top = df_tmp.nlargest(20, "opportunity_score")
    sns.scatterplot(
        data=top,
        x="level",
        y="sector",
        size="opportunity_score",
        hue="jv_potential",
        sizes=(50, 2000),
        palette="hot",
        edgecolor="black",
        alpha=0.7,
        ax=sp3,
    )
    sp3.set_xlabel("NAICS Level")
    sp3.set_ylabel("Sector Code")
    sp3.set_title("High-Opportunity Zones\n(Size = Opportunity Score)")

    risk = 1 - df["complexity_score"]
    reward = df["jv_potential"]
    sns.scatterplot(
        x=risk, y=reward, hue=df["defense_keyword_count"], palette="viridis", s=30, alpha=0.6, ax=sp4
    )
    sp4.set_xlabel("Risk Level (1 – Complexity)")
    sp4.set_ylabel("Reward Potential (JV Score)")
    sp4.set_title("Risk/Reward Analysis\n(Color = Defense Keywords)")
    sp4.axhline(y=reward.median(), color="red", linestyle="--", alpha=0.5)
    sp4.axvline(x=risk.median(), color="red", linestyle="--", alpha=0.5)
    sp4.text(
        0.1,
        0.9,
        "High Risk\nHigh Reward",
        transform=sp4.transAxes,
        bbox=dict(boxstyle="round,pad=0.3", facecolor="yellow", alpha=0.5),
    )
    sp4.text(
        0.7,
        0.9,
        "Low Risk\nHigh Reward",
        transform=sp4.transAxes,
        bbox=dict(boxstyle="round,pad=0.3", facecolor="lightgreen", alpha=0.5),
    )
    fig_spm.tight_layout()
    plots["strategic_matrix"] = _fig_to_base64(fig_spm)
    return plots


def _fig_to_base64(fig) -> str:
    """Convert seaborn figure to base64 string for download"""
    buffer = io.BytesIO()
    fig.savefig(buffer, format="png", dpi=300, bbox_inches="tight", facecolor="white", edgecolor="none")
    buffer.seek(0)
    img_base64 = base64.b64encode(buffer.getvalue()).decode()
    buffer.close()
    return img_base64
