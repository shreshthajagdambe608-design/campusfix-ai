import json
import os
import re
from typing import Dict, Any, List

class GraphifyEngine:
    """
    Graphify Engine for CampusFix AI:
    Transforms reports, locations, categories, and duplicate links
    into a queryable Knowledge Graph, calculating cluster communities
    and generating standard Graphify outputs (graph.json, GRAPH_REPORT.md).
    """

    def __init__(self, output_dir: str = "graphify-out"):
        self.output_dir = output_dir

    def build_graph(self, reports: List[Dict[str, Any]], duplicates_map: Dict[str, List[Dict[str, Any]]] = None) -> Dict[str, Any]:
        nodes = []
        edges = []
        node_ids = set()

        # Track clusters / communities
        locations_count = {}
        categories_count = {}

        # 1. Category Nodes
        categories = ["Plumbing", "Electrical", "Cleaning", "Infrastructure", "Furniture", "Safety", "Other"]
        cat_colors = {
            "Plumbing": "#06b6d4",
            "Electrical": "#eab308",
            "Cleaning": "#14b8a6",
            "Infrastructure": "#78716c",
            "Furniture": "#6366f1",
            "Safety": "#f43f5e",
            "Other": "#94a3b8"
        }
        for cat in categories:
            cid = f"cat_{cat.lower()}"
            nodes.append({
                "id": cid,
                "label": cat,
                "group": "category",
                "color": cat_colors.get(cat, "#94a3b8"),
                "shape": "diamond",
                "size": 22,
                "font": {"color": "#1e293b", "size": 13, "bold": True}
            })
            node_ids.add(cid)

        # 2. Report & Location Nodes
        for r in reports:
            rid = r["id"]
            ai = r.get("ai_analysis", {})
            loc = r.get("user_location", "Unknown")
            cat = ai.get("category", "Other")
            pri = ai.get("priority", "Low")
            status = r.get("status", "Submitted")

            # Priority color coding
            pri_colors = {
                "Urgent": "#ef4444",
                "High": "#f97316",
                "Medium": "#f59e0b",
                "Low": "#3b82f6"
            }
            color = pri_colors.get(pri, "#3b82f6")

            # Add Report Node
            nodes.append({
                "id": rid,
                "label": f"#{rid}: {ai.get('title', r.get('user_description', 'Issue'))[:24]}...",
                "title": f"<b>{ai.get('title', '')}</b><br/>Status: {status}<br/>Priority: {pri}<br/>Location: {loc}",
                "group": "report",
                "color": color,
                "shape": "dot",
                "size": 18 if pri == "Urgent" else (15 if pri == "High" else 12),
                "data": {
                    "id": rid,
                    "title": ai.get("title", ""),
                    "priority": pri,
                    "category": cat,
                    "location": loc,
                    "status": status,
                    "action": ai.get("recommended_action", "")
                }
            })
            node_ids.add(rid)

            # Location Node (Building/Room)
            if loc and loc != "Unknown":
                building = loc.split(",")[0].strip()
                lid = f"loc_{building.lower().replace(' ', '_')}"
                locations_count[building] = locations_count.get(building, 0) + 1

                if lid not in node_ids:
                    nodes.append({
                        "id": lid,
                        "label": f"🏢 {building}",
                        "group": "location",
                        "color": "#4f46e5",
                        "shape": "box",
                        "size": 20,
                        "font": {"color": "#ffffff", "face": "system-ui"}
                    })
                    node_ids.add(lid)

                # Edge: Report -> Location
                edges.append({
                    "from": rid,
                    "to": lid,
                    "label": "LOCATED_IN",
                    "arrows": "to",
                    "color": {"color": "#94a3b8", "opacity": 0.6},
                    "dashes": False
                })

            # Edge: Report -> Category
            cid = f"cat_{cat.lower()}"
            if cid in node_ids:
                categories_count[cat] = categories_count.get(cat, 0) + 1
                edges.append({
                    "from": rid,
                    "to": cid,
                    "label": "IS_A",
                    "arrows": "to",
                    "color": {"color": cat_colors.get(cat, "#cbd5e1"), "opacity": 0.5}
                })

        # 3. Duplicate Cross-Edges (Graphify Cluster Links)
        if duplicates_map:
            for rid, dups in duplicates_map.items():
                for dup in dups:
                    target_id = dup["report_id"]
                    if target_id in node_ids and rid in node_ids:
                        edges.append({
                            "from": rid,
                            "to": target_id,
                            "label": f"DUPLICATE ({int(dup['similarity_score']*100)}%)",
                            "color": {"color": "#ef4444", "highlight": "#dc2626"},
                            "dashes": [5, 5],
                            "width": 2
                        })

        graph_data = {
            "version": "1.0.0",
            "generator": "Graphify-CampusFix",
            "statistics": {
                "total_nodes": len(nodes),
                "total_edges": len(edges),
                "incident_reports": len(reports),
                "building_clusters": len(locations_count),
                "hotspot_building": max(locations_count, key=locations_count.get) if locations_count else "None"
            },
            "nodes": nodes,
            "edges": edges
        }

        return graph_data

    def export_graphify_outputs(self, graph_data: Dict[str, Any]) -> str:
        """Writes standard Graphify outputs: graph.json and GRAPH_REPORT.md"""
        os.makedirs(self.output_dir, exist_ok=True)

        json_path = os.path.join(self.output_dir, "graph.json")
        with open(json_path, "w", encoding="utf-8") as f:
            json.dump(graph_data, f, indent=2)

        report_path = os.path.join(self.output_dir, "GRAPH_REPORT.md")
        stats = graph_data["statistics"]
        with open(report_path, "w", encoding="utf-8") as f:
            f.write("# Graphify Knowledge Graph Report: CampusFix AI\n\n")
            f.write("Generated by **Graphify-CampusFix Engine** for structural maintenance relationships.\n\n")
            f.write("## 📊 Topology Summary\n")
            f.write(f"- **Total Nodes**: {stats['total_nodes']}\n")
            f.write(f"- **Total Directed Edges**: {stats['total_edges']}\n")
            f.write(f"- **Active Incident Reports**: {stats['incident_reports']}\n")
            f.write(f"- **Building Communities**: {stats['building_clusters']}\n")
            f.write(f"- **Primary Incident Hotspot**: {stats['hotspot_building']}\n\n")
            f.write("## 🔍 High-Density Nodes & Duplicate Clusters\n")
            f.write("Graphify detected interconnected incidents and duplicate clusters. Nodes with dashed red edges represent multi-reporter duplicate tickets.\n")

        return self.output_dir

graphify = GraphifyEngine()
