import subprocess


def run_ryu_manager(file_name):
    # Define the Ryu Manager command and the script name
    command = ["ryu-manager", "--observe-links", file_name]

    try:
        # Run the command
        subprocess.run(command, check=True)
        print(f"Successfully ran {file_name} with ryu-manager.")
    except subprocess.CalledProcessError as e:
        print(f"Error while running {file_name}: {e}")
    except FileNotFoundError:
        print("ryu-manager is not found. Ensure it is installed and in your PATH.")


if __name__ == "__main__":
    # Replace 'file_name.py' with your actual Ryu script file
    script_name = "controllers/ProjectController.py"
    run_ryu_manager(script_name)
