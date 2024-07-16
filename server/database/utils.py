import json

def serialize_non_json_values(data):
    """
    Convert lists and dictionaries in a dictionary's values to JSON strings.
    Every other datatype remains constant
    """
    for key, value in data.items():
        if isinstance(value, (list, dict)):
            data[key] = json.dumps(value)
    return data

def deserialize_json_values(data):
    for key, value in data.items():
        if isinstance(value, str):
            try:
                data[key] = json.loads(value)
            except (json.JSONDecodeError, TypeError):
                continue
    return data

