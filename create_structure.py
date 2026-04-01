import os

# Base project folder (change if needed)
BASE_DIR = "api-monitor-frontend"

# Folder structure
folders = [
    "app/dashboard",
    "app/login",
    "app/register",
    "app/dashboard/add-api",
    
    "components",
    "lib",
    "types",
]

# Files to create
files = [
    "components/Navbar.tsx",
    "components/Sidebar.tsx",
    "components/Card.tsx",
    "components/Table.tsx",
    "components/Loader.tsx",
    "components/ProtectedRoute.tsx",

    "lib/axios.ts",
    "lib/auth.ts",

    "types/index.ts",
]

def create_structure():
    for folder in folders:
        path = os.path.join(BASE_DIR, folder)
        os.makedirs(path, exist_ok=True)
        print(f"✅ Folder created: {path}")

    for file in files:
        file_path = os.path.join(BASE_DIR, file)

        # Create empty file if not exists
        if not os.path.exists(file_path):
            with open(file_path, "w") as f:
                f.write("")  # empty file
            print(f"📄 File created: {file_path}")
        else:
            print(f"⚠️ File already exists: {file_path}")

if __name__ == "__main__":
    create_structure()