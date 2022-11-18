<template>
  <PageWrapper title="抽象训练与验证" content="请按照指导输入数据">
    <template #extra>
      <a-space size="middle">
        <a-select v-model:value="example" style="width: 250px" :options="selectOptions" />
        <a-button class="ml-3" type="primary" @click="changeExample(example)"
          >使用案例数据</a-button
        >
      </a-space>
    </template>
    <div class="step-form-form mb-5 ml-5 mr-5">
      <a-steps :current="current">
        <a-step title="env配置" />
        <a-step title="agent配置" />
      </a-steps>
      <div class="steps-action mt-3">
        <a-button v-if="current < stepsNum - 1" type="primary" @click="next">下一项</a-button>
        <a-popconfirm title="确定提交吗" ok-text="确定" cancel-text="取消">
          <a-button v-if="current == stepsNum - 1" type="primary">提交训练</a-button>
        </a-popconfirm>
        <a-button class="ml-3" v-if="current > 0" @click="pre">上一项</a-button>
      </div>
    </div>
    <a-card title="1 env相关配置" v-show="current === 0">
      <h2>1. 请以json格式输入环境配置env_config</h2>
      <JsonEditorVue v-model="env_config" mode="text" :options="cmOptions" />
      <a-divider />
      <h2>2. 请输入环境Class</h2>
      <codemirror
        v-model="env_class"
        placeholder="在这里输入代码"
        :style="codeOptions.style"
        :mode="codeOptions.mode"
        :spellcheck="codeOptions.spellcheck"
        :autofocus="codeOptions.autofocus"
        :indent-with-tab="codeOptions.indentWithTab"
        :tabSize="codeOptions.tabSize"
        :extensions="codeOptions.extensions"
      />
    </a-card>
    <a-card title="2 agent相关配置" v-show="current === 1">
      <h2>1. 请以json格式输入agent配置agent_config</h2>
      <JsonEditorVue v-model="agent_config" mode="text" :options="cmOptions" />
      <a-divider />
      <h2>2. 请输入agent Class</h2>
      <div></div>
      <codemirror
        v-model="agent_class"
        placeholder="在这里输入代码"
        :style="codeOptions.style"
        :mode="codeOptions.mode"
        :spellcheck="codeOptions.spellcheck"
        :autofocus="codeOptions.autofocus"
        :indent-with-tab="codeOptions.indentWithTab"
        :tabSize="codeOptions.tabSize"
        :extensions="codeOptions.extensions"
      />
    </a-card>
  </PageWrapper>
</template>

<script lang="ts">
  import { reactive, ref, defineComponent } from 'vue';
  import { PageWrapper } from '/@/components/Page';
  import type { SelectProps } from 'ant-design-vue';
  import { Divider, Popconfirm, Select, Card, Steps } from 'ant-design-vue';
  import JsonEditorVue from 'json-editor-vue';
  import { python } from '@codemirror/lang-python';
  import { Codemirror } from 'vue-codemirror';
  import defaultData from '/@/views/abstract_verify/data';

  export default defineComponent({
    components: {
      PageWrapper,
      JsonEditorVue,
      Codemirror,
      [Card.name]: Card,
      [Steps.name]: Steps,
      [Steps.Step.name]: Steps.Step,
      [Select.name]: Select,
      [Popconfirm.name]: Popconfirm,
      [Divider.name]: Divider,
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
      const cmOptions = reactive({
        // mode: 'text/javascript',
        mode: 'application/json',
        theme: 'blackboard light',
        // theme: "solarized light",
        // theme: "base16-light",
        readOnly: true,
        lineNumbers: true, // 是否显示行号
        lineWrapping: true, // 是否应滚动或换行以显示长行
        extraKeys: { Ctrl: 'autocomplete' },
        autocorrect: true,
        lineWiseCopyCut: true, // 在没有选择的情况下进行复制或剪切将复制或剪切有光标的整行。
        showCursorWhenSelecting: true, // 选择处于活动状态时是否应绘制光标
        maxHighlightLength: Infinity, // 显示长行的时候 这个值是不限制，如果要做限制的话，值是number类型
        matchBrackets: true, // 光标匹配括号
        foldGutter: true,
        autoCloseTags: true,
        matchTags: { bothTags: true },
        styleActiveLine: true,
        smartIndent: true,
        // gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter', 'CodeMirror-lint-markers'],
        gutters: ['CodeMirror-lint-markers'],
      });
      const codeOptions = reactive({
        style: { height: '500px' },
        mode: 'text/x-python',
        spellcheck: true,
        autofocus: false,
        indentWithTab: true,
        tabSize: 2,
        extensions: [python()], //传递给CodeMirror EditorState。创建({扩展})
      });
      let env_config = ref<string>('');
      let env_class = ref<string>('');
      let agent_config = ref<string>('');
      let agent_class = ref<string>('');
      let verify_config = ref<string>('');
      let train_config = ref<string>('');
      function changeExample(value: string): void {
        console.log('案例切换为：', value);
        env_config.value = defaultData.env_config[value];
        agent_config.value = defaultData.agent_config[value];
        verify_config.value = defaultData.verify_config[value];
        train_config.value = defaultData.train_config[value];
        env_class.value = defaultData.env[value];
        agent_class.value = defaultData.agent[value];
      }
      changeExample('pendulum');

      return {
        example,
        selectOptions,
        current,
        stepsNum,
        next,
        pre,
        cmOptions,
        codeOptions,
        env_config,
        env_class,
        agent_config,
        agent_class,
        verify_config,
        train_config,
        changeExample,
      };
    },
  });
</script>
