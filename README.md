# SDN Interface

This is the interface for a Software-Defined Network system, based on the model developed by Politecnico di Torino University.

## Requirements

### System Requirements
- **Operating System**: Ubuntu 20.04+ or any other distributions
- **Python**: two python versions needed 3.9 and 3.10+
- **Memory**: At least 1 GB RAM
- **Disk Space**: At least 1 GB free

## Dependencies
Install the following system packages:
   ```bash
   sudo apt update
   sudo apt install -y python3.9 python3.9-venv python3.9-dev python3.10 python3.10-venv python3.10-dev git curl build-essential
   ```

## Installation

### Clone the Repository
   ```bash
   git clone https://github.com/xose-aka/sdn_interface.git
   cd sdn_interface
   ```

### Setup model endpoint
1. **Enter model endpoints folders**
   ```bash
   cd intent_model_endpoints
   ```
2. **Set Gemini key**

      1. **Create ```.env``` file**

         ```bash
         gedit .env
         ```
      2. **Set key into the ```.env``` file**

         ```bash
         GEMINI_API_KEY="XXXXXX"
         ```

3. **Setup venv**

      1. **Create venv**

         Use python 3.10 version or higher
            ```bash
             python3.10 -m venv venv
            ```
      2. **Activate venv**
            ```bash
            source venv/bin/activate
            ```

      3. **Install requirements**
            ```bash
            pip install -r requirements.txt
            ```

      4. **Run app**

         Run with ```sudo``` as ```mininet``` must be run with super user privileges
            ```bash
            sudo venv/bin/python run.py
            ```   

### Setup ryu manager endpoints

1. **Enter ryu manager endpoints folders**
  ```bash
  cd ../ryu_endpoints
  ```

2. **Setup venv**

   1. **Create venv**

      Use python 3.9 version
   2. 
      ```bash
      python3.9 -m venv venv
      ```
   2. **Activate venv**

      ```bash
      source venv/bin/activate
      ```

   3. **Install requirements**
      ```bash
      pip install -r requirements.txt
      ```

   4. **Run app**

      Run with ```sudo``` as ```mininet``` must be run with super user privileges
      ```bash
      sudo venv/bin/python run.py
      ```