from rest_framework.response import Response
from rest_framework import status

def api_response(success=True, message="", data=None, errors=None, status_code=status.HTTP_200_OK):
    payload = {
        "success": success,
        "message": message,
        "data": data if data is not None else {},
        "errors": errors if errors is not None else {}
    }
    return Response(payload, status=status_code)
