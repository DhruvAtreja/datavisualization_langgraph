import requests
import os
from typing import List, Any


class DatabaseManager:
    def __init__(self):
        self.endpoint_url = os.getenv("DB_ENDPOINT_URL")

    def get_schema(self, uuid: str) -> str:
        """Retrieve the database schema."""
        try:
            print(f"{self.endpoint_url}/get-schema/{uuid}")
            response = requests.get(
                f"{self.endpoint_url}/get-schema/{uuid}"
            )
            response.raise_for_status()
            return response.json()['schema']
        except requests.RequestException as e:
            raise Exception(f"Error fetching schema: {str(e)}")

    def execute_query(self, uuid: str, query: str) -> List[Any]:
        """Execute SQL query on the remote database and return results."""
        try:
            response = requests.post(
                f"{self.endpoint_url}/execute-query",
                json={"uuid": uuid, "query": query}
            )
            response.raise_for_status()
            return response.json()['results']
        except requests.RequestException as e:
            raise Exception(f"Error executing query: {str(e)}")