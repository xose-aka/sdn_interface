from exceptions.base_exception import AppException


class IntentGoalServiceNotAvailableException(AppException):
    value = "No such goal service available in ryu"

    def __init__(self, value):
        self.value = value
        super().__init__(status_code=405, detail=self.value)
