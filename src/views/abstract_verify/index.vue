<template>
  <PageWrapper title="抽象训练与验证" content="请按照指导输入数据">
    <template #extra>
      <ASpace size="middle">
        <ASelect v-model:value="example" style="width: 250px" :options="selectOptions" />
        <AButton class="ml-3" type="primary" @click="changeExample(example)">使用案例数据</AButton>
      </ASpace>
    </template>
    <div class="step-form-form mb-5 ml-5 mr-5">
      <ASteps :current="current">
        <AStep title="env配置" />
        <AStep title="agent配置" />
        <!-- <a-step title="verify配置" /> -->
      </ASteps>
      <div class="steps-action mt-3">
        <AButton v-if="current < stepsNum - 1" type="primary" @click="next">下一项</AButton>
        <!-- <APopconfirm
          title="确定提交吗"
          ok-text="确定"
          cancel-text="取消"
          @confirm="confirm"
          @cancel="cancel"
        > -->
        <AButton v-if="current == stepsNum - 1" type="primary" @click="submitTask"
          >提交训练</AButton
        >
        <!-- </APopconfirm> -->
        <AButton class="ml-3" v-if="current > 0" @click="prev">上一项</AButton>
      </div>
    </div>
    <ACard title="1 env相关配置" v-show="current === 0">
      <h2>1. 请以json格式输入环境配置env_config</h2>
      <json-editor-vue v-model="taskInfo.env_config" mode="text" :options="cmOptions" />
      <ADivider />
      <h2>2. 请输入环境Class</h2>
      <div></div>
      <codemirror
        v-model="taskInfo.env_class"
        placeholder="在这里输入代码"
        :style="codeOptions.style"
        :mode="codeOptions.mode"
        :spellcheck="codeOptions.spellcheck"
        :autofocus="codeOptions.autofocus"
        :indent-with-tab="codeOptions.indentWithTab"
        :tabSize="codeOptions.tabSize"
        :extensions="codeOptions.extensions"
      />
    </ACard>
    <ACard title="2 anent相关配置" v-show="current === 1">
      <h2>1. 请以json格式输入agent配置agent_config</h2>
      <json-editor-vue v-model="taskInfo.agent_config" mode="text" :options="cmOptions" />
      <ADivider />
      <h2>2. 请输入agent Class</h2>
      <div></div>
      <codemirror
        v-model="taskInfo.agent_class"
        placeholder="在这里输入代码"
        :style="codeOptions.style"
        :mode="codeOptions.mode"
        :spellcheck="codeOptions.spellcheck"
        :autofocus="codeOptions.autofocus"
        :indent-with-tab="codeOptions.indentWithTab"
        :tabSize="codeOptions.tabSize"
        :extensions="codeOptions.extensions"
      />
    </ACard>
    <!-- <ACard title="3 verify相关配置" v-show="current === 2">
      <h2>1. 请以json格式输入verify相关配置verify_config</h2>
      <JsonEditorVue v-model="env_config" mode="text" :options="cmOptions" />
    </ACard> -->
  </PageWrapper>
</template>
<script lang="ts" setup>
  import { useGo } from '/@/hooks/web/usePage';
  import { toRaw } from '@vue/reactivity';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { RunTask } from '/@/api/sys/trainify';
  import { useResultStore } from '/@/store/modules/result';
  import { reactive, ref, getCurrentInstance } from 'vue';
  import { PageWrapper } from '/@/components/Page';
  import JsonEditorVue from 'json-editor-vue';
  import { Codemirror } from 'vue-codemirror';
  import { python } from '@codemirror/lang-python';
  import defaultData from '/@/views/abstract_verify/data';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { randomString } from '/@/utils/randomString';
  import axios from 'axios';

  const { t } = useI18n();
  const go = useGo();
  const { createMessage, createErrorModal } = useMessage();
  const selectOptions = ref([
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
  function prev(): void {
    current.value--;
  }
  // function confirm(e: MouseEvent): void {
  //   submitTask();
  // }
  // function cancel(e: MouseEvent): void {
  //   console.log(e);
  // }

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

  const taskInfo = reactive({
    channel: randomString(6),
    env_config: '',
    agent_config: '',
    verify_config: '',
    train_config: '',
    env_class: '',
    agent_class: '',
  });
  function changeExample(value: string): void {
    console.log('案例切换为：', value);
    taskInfo.env_config = defaultData.env_config[value];
    taskInfo.agent_config = defaultData.agent_config[value];
    taskInfo.verify_config = defaultData.verify_config[value];
    taskInfo.train_config = defaultData.train_config[value];
    taskInfo.env_class = defaultData.env[value];
    taskInfo.agent_class = defaultData.agent[value];
  }
  changeExample('pendulum');
  const { proxy } = getCurrentInstance();
  proxy.$goeasy.connect({
    id: '001', //pubsub选填，im必填，最大长度60字符
    data: {}, //必须是一个对象，pubsub选填，im必填，最大长度300字符，用于上下线提醒和查询在线用户列表时，扩展更多的属性
    onSuccess: function () {
      console.log('GoEasy 连接成功');
    },
    onFailed: function (error) {
      console.log('Failed to connect GoEasy, code:' + error.code + ',error:' + error.content);
    },
    onProgress: function (attempts) {
      console.log('GoEasy is connecting', attempts);
    },
  });

  // async function submitTask(): Promise<void>
  async function submitTask(): Promise<void> {
    // //mac版本直接采用axios方式发送post请求，会出现跨域问题
    // axios({
    //   url: 'http://127.0.0.1:3000/tbridge/t/',
    //   method: 'post',
    //   data: {
    //     task_name: 'trainify_verify',
    //   },
    // }).then((res) => {
    //   console.log(res);
    // });
    let res = await RunTask({
      channel: taskInfo.channel,
      task_name: 'trainify_verify',
      params: {
        env_class: taskInfo.env_class,
        agent_class: taskInfo.agent_class,
        env_config: JSON.parse(taskInfo.env_config),
        agent_config: JSON.parse(taskInfo.agent_config),
        verify_config: JSON.parse(taskInfo.verify_config),
        train_config: JSON.parse(taskInfo.train_config),
      },
    });
    if (res.code === 20000) {
      console.log('成功返回');
      proxy.$goeasy.pubsub.subscribe({
        channel: taskInfo.channel,
        onMessage: function (message) {
          console.log(message);
        },
        onSuccess: function () {
          console.log('Channel ' + taskInfo.channel + ' 订阅成功。');
        },
        onFailed: function (error) {
          createErrorModal({
            title: t('sys.api.errorTip'),
            content: '建立WebSocket通信连接成功，但是订阅频道失败，请稍后再试 ' + error,
          });
        },
      });
      go('/result/index/' + taskInfo.channel);
    } else {
      createErrorModal({
        title: t('sys.api.errorTip'),
        content: res.data.msg,
      });
    }
  }
</script>
