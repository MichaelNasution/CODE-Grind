JAVAC = javac
JAVA = java
SRC_DIR = src/main/java
OUT_DIR = out
MAIN_CLASS = com.itdel.MainApp

# Target utama: Kompilasi dan langsung jalankan
all: run

# Menjalankan program (Dependensi ke compile memastikan kode selalu terbaru)
run: compile
	$(JAVA) -cp $(OUT_DIR) $(MAIN_CLASS)

# Proses kompilasi file Java
compile:
	@if not exist $(OUT_DIR) mkdir $(OUT_DIR)
	$(JAVAC) -d $(OUT_DIR) $(SRC_DIR)/com/itdel/model/*.java $(SRC_DIR)/com/itdel/service/*.java $(SRC_DIR)/com/itdel/util/*.java $(SRC_DIR)/com/itdel/MainApp.java

# Membersihkan folder out
clean:
	@if exist $(OUT_DIR) rmdir /s /q $(OUT_DIR)

javac -d out src/main/java/com/itdel/model/*.java src/main/java/com/itdel/service/*.java src/main/java/com/itdel/util/*.java src/main/java/com/itdel/MainApp.java; java -cp out com.itdel.MainApp

