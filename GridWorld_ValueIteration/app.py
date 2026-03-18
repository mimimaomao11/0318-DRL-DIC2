from flask import Flask, render_template, request, jsonify
from rl_env import GridWorld, run_value_iteration_step, solve_value_iteration

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/iterate', methods=['POST'])
def iterate():
    data = request.json
    width = data.get('width', 5)
    height = data.get('height', 5)
    start = tuple(data.get('start', [0, 0]))
    end = tuple(data.get('end', [4, 4]))
    obstacles = [tuple(o) for o in data.get('obstacles', [])]
    current_values = data.get('values', [[0]*width for _ in range(height)])

    gw = GridWorld(width=width, height=height, start=start, end=end, obstacles=obstacles)
    new_values, policy, delta = run_value_iteration_step(gw, current_values)
    
    return jsonify({
        'values': new_values,
        'policy': policy,
        'delta': delta
    })

@app.route('/api/solve', methods=['POST'])
def solve():
    data = request.json
    width = data.get('width', 5)
    height = data.get('height', 5)
    start = tuple(data.get('start', [0, 0]))
    end = tuple(data.get('end', [4, 4]))
    obstacles = [tuple(o) for o in data.get('obstacles', [])]

    gw = GridWorld(width=width, height=height, start=start, end=end, obstacles=obstacles)
    new_values, policy = solve_value_iteration(gw)
    
    return jsonify({
        'values': new_values,
        'policy': policy
    })

if __name__ == '__main__':
    app.run(debug=True, port=5000)
