# ============================================================
#   MAKEFILE — Warung Makan Barokah CLI
#   UTS Pemrograman Prosedural | C# Console Application
# ============================================================

# ── Variabel ─────────────────────────────────────────────────
DOTNET     = dotnet
PROJECT    = UTS_YUDHA.csproj
EXE_DIR    = bin\Debug\net8.0
EXE        = $(EXE_DIR)\UTS_YUDHA.exe

# ─────────────────────────────────────────────────────────────
#  DEFAULT TARGET
# ─────────────────────────────────────────────────────────────
all: build

# ─────────────────────────────────────────────────────────────
#  BUILD (Compile)
# ─────────────────────────────────────────────────────────────
build:
	$(DOTNET) build $(PROJECT)

# ─────────────────────────────────────────────────────────────
#  RUN (Build + Jalankan langsung)
# ─────────────────────────────────────────────────────────────
run:
	$(DOTNET) run --project $(PROJECT)

# ─────────────────────────────────────────────────────────────
#  CLEAN (Hapus hasil build)
# ─────────────────────────────────────────────────────────────
clean:
	$(DOTNET) clean $(PROJECT)

.PHONY: all build run clean
