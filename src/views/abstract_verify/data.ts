export default {
  agent: {
    pendulum: `
import random

import numpy as np
import torch
import torch.nn as nn
import torch.nn.functional as F
import torch.optim as optim
from trainify.utils import str_to_list


def create_modules(agent_config):
    """
    根据解析cfg文件的结果来构造模块
    :param blocks:
    :return:
    """
    blocks = agent_config.get("modules")
    assert blocks is not None, "没有给定actor网络参数"
    module = nn.Sequential()

    for index, x in enumerate(blocks[:]):

        # If it"s a linear layer
        if (x["type"] == "linear"):
            # Get the info about the layer
            in_features = x["in_features"]
            out_features = x["out_features"]
            mean = x["mean"]
            std = x["std"]
            bias_zero = x["bias_zero"]
            activation = x["activation"]

            # Add the linear layer
            linear = nn.Linear(in_features=in_features, out_features=out_features)
            linear.weight.data.normal_(mean, std)
            if bias_zero:
                linear.bias.data.zero_()

            module.add_module("linear_{0}".format(index), linear)

            # activation
            if activation == "tanh":
                act = nn.Tanh()
                module.add_module("tanh_{0}".format(index), act)

    return module


class Actor(nn.Module):
    def __init__(self, agent_config):
        super(Actor, self).__init__()
        self.module_sequential = create_modules(agent_config)

    def forward(self, x):
        return self.module_sequential(x)


class Critic(nn.Module):
    def __init__(self, input_size, hidden_size, output_size):
        super().__init__()
        self.linear1 = nn.Linear(input_size, hidden_size)
        self.linear2 = nn.Linear(hidden_size, hidden_size)
        self.linear3 = nn.Linear(hidden_size, output_size)

    def forward(self, s, a):
        x = torch.cat([s, a], 1)
        x = F.relu(self.linear1(x))
        x = F.relu(self.linear2(x))
        x = self.linear3(x)
        return x


class Agent(object):
    def __init__(self, env, config):
        self.config = config
        self.originEnv = env
        self.env = env
        self.gamma = config["gamma"]
        self.actor_lr = config["actor_lr"]
        self.critic_lr = config["critic_lr"]
        self.tau = config["tau"]
        self.capacity = config["capacity"]
        self.batch_size = config["batch_size"]
        self.hidden_size = config["hidden_size"]
        s_dim = self.env.observation_space.shape[0] * 2
        a_dim = self.env.action_space.shape[0]

        self.actor = Actor(self.config)
        self.network = Actor(self.config)
        self.actor_target = Actor(self.config)
        self.critic = Critic(s_dim + a_dim, self.hidden_size, a_dim)
        self.critic_target = Critic(s_dim + a_dim, self.hidden_size, a_dim)
        self.actor_optim = optim.Adam(self.actor.parameters(), lr=self.actor_lr)
        self.critic_optim = optim.Adam(self.critic.parameters(), lr=self.critic_lr)
        self.buffer = []

        self.actor_target.load_state_dict(self.actor.state_dict())
        self.critic_target.load_state_dict(self.critic.state_dict())

    def reset(self):
        self.env = self.originEnv
        self.gamma = self.config["gamma"]
        self.actor_lr = self.config["actor_lr"]
        self.critic_lr = self.config["critic_lr"]
        self.tau = self.config["tau"]
        self.capacity = self.config["capacity"]
        self.batch_size = self.config["batch_size"]

        s_dim = self.originEnv.observation_space.shape[0] * 2
        a_dim = self.originEnv.action_space.shape[0]

        self.actor = Actor(self.config)
        self.network = Actor(self.config)
        self.actor_target = Actor(self.config)
        self.critic = Critic(s_dim + a_dim, self.hidden_size, a_dim)
        self.critic_target = Critic(s_dim + a_dim, self.hidden_size, a_dim)
        self.actor_optim = optim.Adam(self.actor.parameters(), lr=self.actor_lr)
        self.critic_optim = optim.Adam(self.critic.parameters(), lr=self.critic_lr)
        self.buffer = []
        self.actor_target.load_state_dict(self.actor.state_dict())
        self.critic_target.load_state_dict(self.critic.state_dict())

    def act(self, s0):
        abs = str_to_list(s0)
        s0 = torch.tensor(abs, dtype=torch.float).unsqueeze(0)
        a0 = self.actor(s0).squeeze(0).detach().numpy()
        return a0

    def put(self, *transition):
        if len(self.buffer) == self.capacity:
            self.buffer.pop(0)
        self.buffer.append(transition)

    def learn(self):
        if len(self.buffer) < self.batch_size:
            return

        samples = random.sample(self.buffer, self.batch_size)

        s0, a0, r1, s1 = zip(*samples)

        s0 = torch.tensor(np.array(s0), dtype=torch.float)
        a0 = torch.tensor(np.array(a0), dtype=torch.float)
        r1 = torch.tensor(np.array(r1), dtype=torch.float).view(self.batch_size, -1)
        s1 = torch.tensor(np.array(s1), dtype=torch.float)

        def critic_learn():
            a1 = self.actor_target(s1).detach()
            y_true = r1 + self.gamma * self.critic_target(s1, a1).detach()

            y_pred = self.critic(s0, a0)

            loss_fn = nn.MSELoss()
            loss = loss_fn(y_pred, y_true)
            self.critic_optim.zero_grad()
            loss.backward()
            self.critic_optim.step()

        def actor_learn():
            loss = -torch.mean(self.critic(s0, self.actor(s0)))
            self.actor_optim.zero_grad()
            loss.backward()
            self.actor_optim.step()

        def soft_update(net_target, net, tau):
            for target_param, param in zip(net_target.parameters(), net.parameters()):
                target_param.data.copy_(target_param.data * (1.0 - tau) + param.data * tau)

        critic_learn()
        actor_learn()
        soft_update(self.critic_target, self.critic, self.tau)
        soft_update(self.actor_target, self.actor, self.tau)


if __name__ == "__main__":
    agent_config = {
        "modules": [
            {
                "type": "linear",
                "in_features": 8,
                "out_features": 8,
                "mean": 0,
                "std": 0.1,
                "bias_zero": true,
                "activation": "tanh",
            },
            {
                "type": "linear",
                "in_features": 8,
                "out_features": 8,
                "mean": 0,
                "std": 0.1,
                "bias_zero": true,
                "activation": "tanh",
            },
            {
                "type": "linear",
                "in_features": 8,
                "out_features": 2,
                "mean": 0,
                "std": 0.1,
                "bias_zero": true,
                "activation": None,
            },
        ]
    }
    act = Actor(agent_config)
    print(act)


  `,
    cartpole: '123',
  },
  env: {
    pendulum: `import gym
from gym import spaces
from gym.utils import seeding
import numpy as np
from os import path


class Env(gym.Env):
    metadata = {
        "render.modes": ["human", "rgb_array"],
        "video.frames_per_second": 30
    }

    def __init__(self, g=10.0):
        self.max_speed = 8
        self.max_torque = 2.
        self.dt = .05
        self.g = g
        self.m = 1.
        self.l = 1.
        self.viewer = None

        high = np.array([1., 1., self.max_speed], dtype=np.float32)
        self.action_space = spaces.Box(
            low=-self.max_torque,
            high=self.max_torque, shape=(1,),
            dtype=np.float32
        )
        self.observation_space = spaces.Box(
            low=-high,
            high=high,
            dtype=np.float32
        )

        self.seed()

    def seed(self, seed=None):
        self.np_random, seed = seeding.np_random(seed)
        return [seed]

    def step(self, u):
        th, thdot = self.state  # th := theta

        g = self.g
        m = self.m
        l = self.l
        dt = self.dt

        u = np.clip(u, -self.max_torque, self.max_torque)[0]
        self.last_u = u  # for rendering
        costs = angle_normalize(th) ** 2 + .1 * thdot ** 2 + .001 * (u ** 2)

        newthdot = thdot + (-3 * g / (2 * l) * np.sin(th + np.pi) + 3. / (m * l ** 2) * u) * dt
        newth = th + newthdot * dt
        newthdot = np.clip(newthdot, -self.max_speed, self.max_speed)

        self.state = np.array([newth, newthdot])
        return self._get_obs(), -costs, False, {}

    def reset(self):
        # high = np.array([np.pi / 2 + 0.1, 0.1])
        # low = np.array([np.pi / 2 - 0.1, -0.11])
        high = np.array([0.1, 0.1])
        low = np.array([-0.1, -0.1])
        self.state = self.np_random.uniform(low=low, high=high)
        self.last_u = None
        return self._get_obs()

    def _get_obs(self):
        theta, thetadot = self.state
        return np.array([np.cos(theta), np.sin(theta), thetadot])

    def render(self, mode="human"):
        if self.viewer is None:
            from gym.envs.classic_control import rendering
            self.viewer = rendering.Viewer(500, 500)
            self.viewer.set_bounds(-2.2, 2.2, -2.2, 2.2)
            rod = rendering.make_capsule(1, .2)
            rod.set_color(.8, .3, .3)
            self.pole_transform = rendering.Transform()
            rod.add_attr(self.pole_transform)
            self.viewer.add_geom(rod)
            axle = rendering.make_circle(.05)
            axle.set_color(0, 0, 0)
            self.viewer.add_geom(axle)
            fname = path.join(path.dirname(__file__), "assets/clockwise.png")
            self.img = rendering.Image(fname, 1., 1.)
            self.imgtrans = rendering.Transform()
            self.img.add_attr(self.imgtrans)

        self.viewer.add_onetime(self.img)
        self.pole_transform.set_rotation(self.state[0] + np.pi / 2)
        if self.last_u:
            self.imgtrans.scale = (-self.last_u / 2, np.abs(self.last_u) / 2)

        return self.viewer.render(return_rgb_array=mode == "rgb_array")

    def close(self):
        if self.viewer:
            self.viewer.close()
            self.viewer = None


def angle_normalize(x):
    return (((x + np.pi) % (2 * np.pi)) - np.pi)

  `,
    cartpole: '123',
  },
  env_config: {
    pendulum: `
{
    "dim": 3,
    "states_name": ["cos", "sin", "thdot"],
    "state_space": [[-1.5, -1.5, -10], [1.5, 1.5, 10]],
    "abs_initial_intervals": [0.16, 0.16, 0.01],
    "state_key_dim": [0, 1],
    "dynamics": ["sin(x[1])**4+2+x[2]+sin(x[2])", "x[0]+x[2]**3+x[1]", "x[1]*x[0]"]
}
`,
    cartpole: '123',
  },
  agent_config: {
    pendulum: `{
    "gamma": 0.99,
    "actor_lr": 0.0001,
    "critic_lr": 0.001,
    "tau": 0.02,
    "capacity": 10000,
    "batch_size": 32,
    "hidden_size": 256,
    "models_need_save": ["actor", "critic", "actor_target", "critic_target"],
    "modules": [
        {
            "type": "linear",
            "in_features": 6,
            "out_features": 20,
            "mean": 0,
            "std": 0.1,
            "bias_zero": true,
            "activation": "tanh"
        },
        {
            "type": "linear",
            "in_features": 20,
            "out_features": 20,
            "mean": 0,
            "std": 0.1,
            "bias_zero": true,
            "activation": "tanh"
        },
        {
            "type": "linear",
            "in_features": 20,
            "out_features": 20,
            "mean": 0,
            "std": 0.1,
            "bias_zero": true,
            "activation": "tanh"
        },
        {
            "type": "linear",
            "in_features": 20,
            "out_features": 1,
            "mean": 0,
            "std": 0.1,
            "bias_zero": true,
            "activation": "tanh"
        }
    ]
}`,
    cartpole: '123',
  },
  train_config: {
    pendulum: `{
    "step_num": 500,
    "episode_num": 2000,
    "reward_threshold": -3
}`,
  },
  verify_config: {
    pendulum: `{
        "max_iteration": 5
    }`,
    cartpole: '123',
  },
};
