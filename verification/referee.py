"""
CheckiOReferee is a base referee for checking you code.
    arguments:
        tests -- the dict contains tests in the specific structure.
            You can find an example in tests.py.
        cover_code -- is a wrapper for the user function and additional operations before give data
            in the user function. You can use some predefined codes from checkio.referee.cover_codes
        checker -- is replacement for the default checking of an user function result. If given, then
            instead simple "==" will be using the checker function which return tuple with result
            (false or true) and some additional info (some message).
            You can use some predefined codes from checkio.referee.checkers
        add_allowed_modules -- additional module which will be allowed for your task.
        add_close_buildins -- some closed buildin words, as example, if you want, you can close "eval"
        remove_allowed_modules -- close standard library modules, as example "math"

checkio.referee.checkers
    checkers.float_comparison -- Checking function fabric for check result with float numbers.
        Syntax: checkers.float_comparison(digits) -- where "digits" is a quantity of significant
            digits after coma.

checkio.referee.cover_codes
    cover_codes.unwrap_args -- Your "input" from test can be given as a list. if you want unwrap this
        before user function calling, then using this function. For example: if your test's input
        is [2, 2] and you use this cover_code, then user function will be called as checkio(2, 2)
    cover_codes.unwrap_kwargs -- the same as unwrap_kwargs, but unwrap dict.

"""

TYPE_ERROR = False, {"error_code": 1, "message": "You should return a list of lists with integers."}
SIZE_ERROR = False, {"error_code": 2,
                     "message": "Wrong size of answer."}
MS_ERROR = False, {"error_code": 3,
                   "message": "It's not a magic square."}
NORMAL_MS_ERROR = False, {"error_code": 4,
                          "message": "It's not a normal magic square."}
NOT_BASED_ERROR = False, {"error_code": 5,
                          "message": "Hm, this square is not based on given template."}
ALL_OK = True, {"error_code": 100,
                "message": "All ok."}


def check_data(answer_data, user_data):
    #check types
    if isinstance(user_data, list):
        for row in user_data:
            if isinstance(row, list):
                for el in row:
                    if not isinstance(el, int):
                        return TYPE_ERROR
            else:
                return TYPE_ERROR
    else:
        return TYPE_ERROR

    #check sizes
    N = len(answer_data)
    if len(user_data) == N:
        for row in user_data:
            if len(row) != N:
                return SIZE_ERROR
    else:
        return SIZE_ERROR

    #check is it a magic square
    # line_sum = (N * (N ** 2 + 1)) / 2
    line_sum = sum(user_data[0])
    for row in user_data:
        if sum(row) != line_sum:
            return MS_ERROR
    for col in zip(*user_data):
        if sum(col) != line_sum:
            return MS_ERROR
    if sum([user_data[i][i] for i in range(N)]) != line_sum:
        return MS_ERROR
    if sum([user_data[i][N - i - 1] for i in range(N)]) != line_sum:
        return MS_ERROR

    #check is it normal ms
    good_set = set(range(1, N ** 2 + 1))
    user_set = set([user_data[i][j] for i in range(N) for j in range(N)])
    if good_set != user_set:
        return NORMAL_MS_ERROR

    #check it is the square based on input
    for i in range(N):
        for j in range(N):
            if answer_data[i][j] and answer_data[i][j] != user_data[i][j]:
                return NOT_BASED_ERROR

    return ALL_OK


from checkio.signals import ON_CONNECT
from checkio import api
from checkio.referees.io import CheckiOReferee

from tests import TESTS

api.add_listener(
    ON_CONNECT,
    CheckiOReferee(
        tests=TESTS,
        cover_code={
            'python-27': None,
            'python-3': None
        },
        checker=check_data,
        add_allowed_modules=[],
        add_close_buildins=[],
        remove_allowed_modules=[]
    ).on_ready)