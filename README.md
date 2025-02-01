<a href="https://www.polito.it/">
    <img src="https://upload.wikimedia.org/wikipedia/it/archive/4/47/20210407201938%21Logo_PoliTo_dal_2021_blu.png" alt="Polito logo" title="Polito" align="right" height="60" />
</a>



# SDN Interface

![Node Current](https://img.shields.io/badge/node-v20.10.0-green)
![PyPI - Python Version](https://img.shields.io/badge/Python-3.9%20%26%203.12-blue)
[![language](https://img.shields.io/badge/react-%5E18.2.0-%6aa84f?logo=React)](https://react.dev/)
[![language](https://shields.io/badge/TypeScript-3178C6?logo=TypeScript&logoColor=FFF&style=flat-square)](https://www.typescriptlang.org/)

This is the interface for a Software-Defined Network system, based on the model developed by Politecnico di Torino University.

## Requirements

### System Requirements
- **Operating System**: Ubuntu 20.04+ or any other distributions
- **Python**: two python versions needed 3.9 and 3.12
- **Memory**: At least 1 GB RAM
- **Disk Space**: At least 2 GB free


## Dependencies
Install the following system packages(python3.9 and python3.10+):

Add python 3.9 repository 
```bash
    sudo add-apt-repository ppa:deadsnakes/ppa  
   ```

```bash
    sudo apt update
    sudo apt install -y python3.9 python3.9-venv python3.9-dev python3.12 python3.12-venv python3.12-dev git curl build-essential mininet
   ```

Install node 20 and npm to run vite react client:
   ```bash
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt install -y nodejs
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

         Use python 3.12 version or higher
            ```bash
             python3.12 -m venv venv
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
            ```bash
             python run.py
            ```

### Setup ryu manager endpoints

1. **Go back and enter ryu manager endpoints folders**
  
    ```bash
     cd ../ryu_endpoints
    ```

2. **Setup venv**

   1. **Create venv**

      Use python 3.9 version
   
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

      ```bash
       python run.py
      ```

### Setup mininet service
1. **Go back and enter mininet service folders**
   ```bash
    cd ../mininet_service
   ```
2. **Setup venv**

    1. **Create venv**

       Use python 3.12 version or higher
          ```bash
           python3.12 -m venv venv
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

### Setup intent client

1. **Go to repository root folder then enter intent client folder**
  
    ```bash
     cd intent_client
    ```

2. **Setup packages**

    ```bash
     npm install
    ```
3. **Build project**

    ```bash
     npm run build
    ```
   
4. **Run project**

     ```bash
      npx serve -s dist
     ```

5. **Enter the application**

    Go to browser and open link ```http://localhost:3000 ```
