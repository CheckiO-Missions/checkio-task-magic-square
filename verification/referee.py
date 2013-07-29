import random
from copy import deepcopy

TESTS = None
CURRENT_TEST = None
#options
RAND_TESTS_QUANTITY = None

def initial_checkio(data):
    global TESTS
    global CURRENT_TEST
    global RAND_TESTS_QUANTITY
    global FLOAT_PRECISION
    TESTS = data.get("tests", data.get("rand_tests", []))

    options = data.get("options", {})
    RAND_TESTS_QUANTITY = options.get("rand_tests_quantity", 0)
    if RAND_TESTS_QUANTITY <= 0:
        RAND_TESTS_QUANTITY = -1

    if RAND_TESTS_QUANTITY == -1 and TESTS:
        CURRENT_TEST = TESTS.pop(0)
    else:
        if RAND_TESTS_QUANTITY and TESTS:
            CURRENT_TEST = random.choice(TESTS)
            RAND_TESTS_QUANTITY -= 1
        else:
            raise DoneTest(1)

    return deepcopy(CURRENT_TEST["input"])


def checkio(data):
    global TESTS
    global CURRENT_TEST
    global RAND_TESTS_QUANTITY
    CURRENT_TEST["user_answer"] = data

    result = check_data(data, CURRENT_TEST["input"])
    CURRENT_TEST['result'] = result[0]
    CURRENT_TEST['error_code'] = result[1]
    CURRENT_TEST['message'] = result[2]

    ext_animation(CURRENT_TEST)
    if not CURRENT_TEST["result"]:
        raise FailTest('ERROR')

    if RAND_TESTS_QUANTITY == -1 and TESTS:
        CURRENT_TEST = TESTS.pop(0)
    else:
        if RAND_TESTS_QUANTITY and TESTS:
            CURRENT_TEST = random.choice(TESTS)
            RAND_TESTS_QUANTITY -= 1
        else:
            raise DoneTest(1)

    return deepcopy(CURRENT_TEST["input"])

TYPE_ERROR = False, 1, "You should return a list of lists with integers."
SIZE_ERROR = False, 2, "Wrong size of answer."
MS_ERROR = False, 3, "It's not a magic square."
NORMAL_MS_ERROR = False, 4, "It's not a normal magic square."
NOT_BASED_ERROR = False, 5, "Hm, this square is not based on given template."
ALL_OK = True, 100, "All ok."


def check_data(user_data, input_data):
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
    N = len(input_data)
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
            if input_data[i][j] and input_data[i][j] != user_data[i][j]:
                return NOT_BASED_ERROR

    return ALL_OK