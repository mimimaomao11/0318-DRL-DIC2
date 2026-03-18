import copy

class GridWorld:
    def __init__(self, width=5, height=5, start=(0,0), end=(4,4), obstacles=[(1,1), (2,2), (3,3)]):
        self.width = width
        self.height = height
        self.start = start
        self.end = end
        self.obstacles = set(tuple(o) for o in obstacles)
        self.gamma = 0.9
        self.step_penalty = -0.1
        self.goal_reward = 1.0

        # Actions: Up, Down, Left, Right
        self.actions = [(-1, 0), (1, 0), (0, -1), (0, 1)]
        self.action_names = ['Up', 'Down', 'Left', 'Right']

    def is_valid_state(self, state):
        r, c = state
        if r < 0 or r >= self.height or c < 0 or c >= self.width:
            return False
        if state in self.obstacles:
            return False
        return True

    def get_next_state(self, state, action_idx):
        if state == self.end:
            return state
        r, c = state
        dr, dc = self.actions[action_idx]
        next_state = (r + dr, c + dc)
        if self.is_valid_state(next_state):
            return next_state
        return state # Bounce back

    def get_reward(self, state, next_state):
        if state == self.end:
            return 0.0 # Terminal state
        if next_state == self.end:
            return self.goal_reward
        return self.step_penalty

def run_value_iteration_step(grid_world, current_values):
    new_values = copy.deepcopy(current_values)
    policy = [['' for _ in range(grid_world.width)] for _ in range(grid_world.height)]
    delta = 0.0

    for r in range(grid_world.height):
        for c in range(grid_world.width):
            state = (r, c)
            if state in grid_world.obstacles:
                new_values[r][c] = 0.0
                policy[r][c] = ''
                continue
            if state == grid_world.end:
                new_values[r][c] = 0.0
                policy[r][c] = 'Goal'
                continue

            best_val = -float('inf')
            best_action = 0

            for a_idx, action in enumerate(grid_world.actions):
                next_state = grid_world.get_next_state(state, a_idx)
                reward = grid_world.get_reward(state, next_state)
                nr, nc = next_state
                v_next = current_values[nr][nc]
                val = reward + grid_world.gamma * v_next

                if val > best_val:
                    best_val = val
                    best_action = a_idx

            new_values[r][c] = best_val
            policy[r][c] = grid_world.action_names[best_action]
            delta = max(delta, abs(best_val - current_values[r][c]))

    return new_values, policy, delta

def solve_value_iteration(grid_world, max_iters=1000, tol=1e-4):
    values = [[0.0 for _ in range(grid_world.width)] for _ in range(grid_world.height)]
    for _ in range(max_iters):
        values, policy, delta = run_value_iteration_step(grid_world, values)
        if delta < tol:
            break
    return values, policy
