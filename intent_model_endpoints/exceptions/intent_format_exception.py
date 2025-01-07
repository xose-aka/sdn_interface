from exceptions.base_exception import AppException


class IntentFormatException(AppException):
    def __init__(self, value):
        super().__init__(status_code=406, detail=value)
