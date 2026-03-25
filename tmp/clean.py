import os
import shutil

base = r'C:\Users\Devil\Desktop\Chocket\app\product'
for entry in os.listdir(base):
    if entry != '[id]': # keep the good one
        path = os.path.join(base, entry)
        print(f"Cleaning suspected garbage: {path}")
        try:
            if os.path.isdir(path):
                shutil.rmtree(path)
                print(f"  Deleted: {path}")
            else:
                os.remove(path)
                print(f"  Removed: {path}")
        except Exception as e:
            print(f"  Failed to delete {path}: {e}")
