<template>
  <PageWrapper title="抽象训练与验证" content="请按照指导输入数据">
    <template #extra>
      <a-space size="middle">
        <a-select v-model:value="example" style="width: 250px" :options="selectOptions" />
        <a-button type="primary">使用案例数据</a-button>
      </a-space>
    </template>
    <div>
      <a-steps :current="current">
        <a-step title="env配置" />
        <a-step title="agent配置" />
      </a-steps>
      <div>
        <a-button v-if="current < stepsNum - 1" type="primary" @click="next">下一项</a-button>
        <a-popconfirm title="确定提交吗" ok-text="确定" cancel-text="取消">
          <a-button v-if="current == stepsNum - 1" type="primary">提交训练</a-button>
        </a-popconfirm>
        <a-button v-if="current > 0" @click="pre">上一项</a-button>
      </div>
    </div>
    <a-card title="1 env相关配置">
      <h2>1. 请以json格式输入环境配置env_config</h2>
    </a-card>
    <a-card title="2 agent相关配置">
      <h2>1. 请以json格式输入agent配置agent_config</h2>
    </a-card>
  </PageWrapper>
</template>

<script lang="ts">
  import { PageWrapper } from '/@/components/Page';
  import type { SelectProps } from 'ant-design-vue';
  import { ref, defineComponent } from 'vue';
  import { Popconfirm, Select, Card, Steps } from 'ant-design-vue';
  export default defineComponent({
    components: {
      PageWrapper,
      [Card.name]: Card,
      [Steps.name]: Steps,
      [Steps.Step.name]: Steps.Step,
      [Select.name]: Select,
      [Popconfirm.name]: Popconfirm,
    },
    setup() {
      const selectOptions = ref<SelectProps['options']>([
        {
          value: 'pendulum',
          label: 'Pendulum环境与DDPG算法',
        },
      ]);
      let example = ref<string>('pendulum');
      let current = ref<number>(0);
      const stepsNum = ref<number>(2);

      function next(): void {
        current.value++;
      }

      function pre(): void {
        current.value--;
      }

      return {
        example,
        selectOptions,
        current,
        stepsNum,
        next,
        pre,
      };
    },
  });
</script>
