## Package Manager
This project uses [uv](https://github.com/astral-sh/uv), which replaces the following tools: `pip`, `virtualenv`, `pipx`, `poetry`, `pyenv`.

1. Install uv with winget
```sh
winget install --id=astral-sh.uv -e
```

2. Initializing new uv project
```sh
uv init <PROJECT_NAME>
cd <PROJECT_NAME>

uv venv # create virtual environment
# NOTE: remember to switch/select the specific .venv python interpreter that was created
```

3. Configuring uv dependencies
```sh
uv add ruff fastapi[standard] # adding dependencies
uv remove ruff # removing dependencies

uvx ruff check . # run PyPI tools w/o global install using `uvx` (kind of like npx)
uv tool install black # install tools globally (isolated from system Python and projects)

uv tree # list all dependencies in your app

uv add --dev pytest # adding dev dependencies

# re-sync packages to uv.lock, e.g. accidentally deleting a dep in pyproject.toml
uv sync

# running python files and fastapi server
uv run test.py
uv run fastapi dev
```