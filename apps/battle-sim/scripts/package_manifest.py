"""打包 script/pkm 目录结构到 XML 的脚本。

特殊规则：
- moves-data.js / pokedex-data.js 只保留前 100 行内容（避免 XML 过大）
"""

from __future__ import annotations

import xml.etree.ElementTree as ET
from pathlib import Path
from typing import Iterable
from xml.dom import minidom


PROJECT_ROOT = Path(__file__).parent.parent  # 回到 pkm12/ 根目录
OUTPUT_XML_FILE = PROJECT_ROOT / "pkm_summary.xml"

EXCLUDED_ITEMS: set[str] = {
    # === Git/IDE ===
    ".git",
    ".idea",
    ".vscode",
    ".DS_Store",
    
    # === Node/Python 环境 ===
    "node_modules",
    "dist",
    "build",
    "__pycache__",
    "venv",
    ".venv",
    "env",
    
    # === 项目特定排除 ===
    "ST",              # 酒馆插件（独立维护）
    "docs",            # 文档目录
    "scripts",         # 打包脚本目录
    ".github",         # GitHub Actions 配置
    "public",          # Vite public 目录
    
    # === 资源目录（二进制文件）===
    "avatar",          # 训练家头像 PNG
    "bgm",             # 背景音乐 MP3
    "sfx",             # 音效 MP3
    
    # === 配置文件 ===
    "package-lock.json",
    "vite.config.js",
    ".gitignore",
    
    # === 输出文件 ===
    OUTPUT_XML_FILE.name,
    "package_manifest.py",
    "pkm_summary.xml",
}

ALLOWED_EXTENSIONS: set[str] = {
    ".py",
    ".pyi",
    ".js",
    ".jsx",
    ".ts",
    ".tsx",
    ".json",
    ".jsonc",
    ".md",
    ".mdx",
    ".txt",
    ".html",
    ".htm",
    ".css",
    ".scss",
    ".sass",
    ".less",
    ".yml",
    ".yaml",
    ".toml",
    ".ini",
    ".cfg",
    ".conf",
    ".env",
    ".sh",
    ".bash",
    ".zsh",
    ".ps1",
    ".xml",
}

ALLOWED_FILENAMES: set[str] = {
    "Dockerfile",
    "Makefile",
    "Procfile",
    "LICENSE",
    "README",
    "README.md",
}

TRUNCATE_HEAD_100: set[str] = {
}

TRUNCATE_HEAD_TAIL: dict[str, tuple[int, int]] = {}


def sanitize_for_xml(text: str) -> str:
    return "".join(
        ch
        for ch in text
        if ch in "\t\n\r"
        or 0x20 <= ord(ch) <= 0xD7FF
        or 0xE000 <= ord(ch) <= 0xFFFD
        or 0x10000 <= ord(ch) <= 0x10FFFF
    )


def should_include_file(path: Path) -> bool:
    if path.name in ALLOWED_FILENAMES:
        return True
    suffix = path.suffix.lower()
    return suffix in ALLOWED_EXTENSIONS if suffix else False


def list_directory(path: Path) -> Iterable[Path]:
    return sorted(path.iterdir(), key=lambda p: (p.is_file(), p.name.lower()))


def read_file_text(path: Path) -> str:
    try:
        if path.name in TRUNCATE_HEAD_100:
            content = path.read_text(encoding="utf-8", errors="replace")
            lines = content.splitlines()
            head = "\n".join(lines[:100])
            if len(lines) > 100:
                head += "\n\n[... truncated: only first 100 lines included ...]\n"
            return head

        if path.name in TRUNCATE_HEAD_TAIL:
            content = path.read_text(encoding="utf-8", errors="replace")
            head_lines, tail_lines = TRUNCATE_HEAD_TAIL[path.name]
            lines = content.splitlines()
            if len(lines) <= head_lines + tail_lines:
                return content
            head = "\n".join(lines[:head_lines])
            tail = "\n".join(lines[-tail_lines:])
            return (
                f"{head}\n\n"
                f"[... truncated: showing first {head_lines} and last {tail_lines} lines of {path.name} "
                f"(total {len(lines)} lines) ...]\n\n"
                f"{tail}"
            )

        return path.read_text(encoding="utf-8")
    except UnicodeDecodeError:
        return "[Binary or non-UTF-8 content not included]"
    except Exception as exc:  # noqa: BLE001
        return f"[Error reading file: {exc}]"


def build_xml_tree(current_path: Path, parent_element: ET.Element) -> None:
    for item in list_directory(current_path):
        if item.name in EXCLUDED_ITEMS:
            continue
        
        if item.is_dir():
            # 递归处理子目录 (public/, engine/, data/, scripts/, docs/)
            dir_el = ET.SubElement(parent_element, "directory", name=item.name)
            build_xml_tree(item, dir_el)
            continue
            
        if not item.is_file() or not should_include_file(item):
            continue

        file_el = ET.SubElement(parent_element, "file", name=item.name)
        content = read_file_text(item)
        file_el.text = sanitize_for_xml(content)


def _wrap_text_nodes_with_cdata(doc: minidom.Document, node: minidom.Node) -> None:
    if node.nodeType == node.ELEMENT_NODE and getattr(node, "tagName", None) == "file":
        child = node.firstChild
        if child and child.nodeType == child.TEXT_NODE and child.data:
            safe = child.data.replace("]]>", "]] ]><![CDATA[>")
            node.replaceChild(doc.createCDATASection(safe), child)
    for child in list(node.childNodes or []):
        _wrap_text_nodes_with_cdata(doc, child)


def pretty_print_xml(element: ET.Element) -> str:
    raw = ET.tostring(element, encoding="utf-8")
    dom = minidom.parseString(raw)
    _wrap_text_nodes_with_cdata(dom, dom.documentElement)
    return dom.toprettyxml(indent="    ", newl="\n")


def main() -> None:
    print("开始打包 script/pkm 目录 …")
    root = ET.Element("pkm_project")
    build_xml_tree(PROJECT_ROOT, root)
    pretty_xml = pretty_print_xml(root)
    lines = [line for line in pretty_xml.splitlines() if line.strip()]
    OUTPUT_XML_FILE.write_text("\n".join(lines), encoding="utf-8")
    print(f"打包完成，输出文件: {OUTPUT_XML_FILE}")


if __name__ == "__main__":
    main()
