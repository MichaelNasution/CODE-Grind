JAVAC = javac
JAVA = java
SRC_DIR = src/main/java
OUT_DIR = out
MAIN_CLASS = com.itdel.MainApp

# Default target
all: compile

# Compile all java files
compile:
	@if not exist $(OUT_DIR) mkdir $(OUT_DIR)
	$(JAVAC) -d $(OUT_DIR) $(SRC_DIR)/com/itdel/model/*.java $(SRC_DIR)/com/itdel/service/*.java $(SRC_DIR)/com/itdel/util/*.java $(SRC_DIR)/com/itdel/MainApp.java

# Run the application
run:
	$(JAVA) -cp $(OUT_DIR) $(MAIN_CLASS)

# Clean build artifacts
clean:
	@if exist $(OUT_DIR) rmdir /s /q $(OUT_DIR)
