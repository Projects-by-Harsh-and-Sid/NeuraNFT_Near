https://py-near.readthedocs.io/en/latest/account.html#function_call



# Setup
> it is not compatible with python=3.12
> follow this thread for update    `https://github.com/pvolnov/py-near/issues/18`
```bash
conda create -n near-dev2 python=3.10 

conda activate near-dev2

pip install pynear
```

To install pynear, you'll need to follow these steps due to some specific requirements:

## Prerequisites

Before installing pynear, ensure you have:
- Python and pip installed
- Microsoft Visual C++ 14.0 or greater (on Windows)[2]

## Installation Steps

**For Windows Users:**
1. Install Microsoft Visual C++ Build Tools:
   - Download from the official Microsoft Visual Studio website
   - Install the version that includes the C++ compiler[2]

2. Install the required dependency:
```bash
pip install ed25519
```

3. Install pynear:
```bash
pip install pynear
```

## Basic Usage

Here's a simple example to get started:

```python
from pynear.account import Account
import asyncio
from pynear.dapps.core import NEAR

ACCOUNT_ID = "your_account.near"
PRIVATE_KEY = "ed25519:..."

async def main():
    acc = Account(ACCOUNT_ID, PRIVATE_KEY)
    await acc.startup()
    print(await acc.get_balance() / NEAR)

asyncio.run(main())
```[1]

**Troubleshooting:**
If you encounter installation errors, try:
- Upgrading pip: `pip install --upgrade pip`
- Using a virtual environment
- Checking your internet connection
- Verifying the package name is typed correctly[2]

Citations:
[1] https://py-near.readthedocs.io/en/latest/
[2] https://github.com/orgs/community/discussions/103109
[3] https://www.payoneer.com
[4] https://paynearby.in
[5] https://pypi.org/project/pynear/
[6] https://play.google.com/store/apps/details?hl=en_IN&id=com.bnb.paynearby
[7] https://www.youtube.com/watch?v=DFqxhAvWp4M