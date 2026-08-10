from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status

def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)

    if response is not None:
        error_data = response.data
        message = "An error occurred"

        if isinstance(error_data, dict):
            if "detail" in error_data:
                message = str(error_data.pop("detail"))
            elif "non_field_errors" in error_data:
                message = str(error_data.pop("non_field_errors")[0]) if error_data["non_field_errors"] else message
            errors = error_data
        elif isinstance(error_data, list):
            message = str(error_data[0]) if error_data else message
            errors = {"detail": error_data}
        else:
            errors = {"detail": str(error_data)}

        response.data = {
            "success": False,
            "message": message,
            "data": {},
            "errors": errors
        }
    else:
        # Handle unhandled server errors cleanly without leaking tracebacks
        response = Response(
            {
                "success": False,
                "message": "Internal server error",
                "data": {},
                "errors": {"detail": str(exc)}
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

    return response
