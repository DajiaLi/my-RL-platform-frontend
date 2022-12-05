<template>
  <PageWrapper title="训练结果">
    <template #headerContent>
      <div class="flex justify-between items-center">
        <span class="flex-1">
          请耐心等待实验结束（不同的环境维度和网络大小会导致时间不定，我们提供的案例的训练时间约1分钟，验证时间约分钟）
        </span>
        <span>本次实验与后端通信频道id：{{ route.params.id }}</span>
      </div>
    </template>
    <Description @register="infoRegister" class="enter-y" />
    <div class="mb-2"></div>
    <div class="mb-2"></div>
    <ARow>
      <ACol :span="17">
        <ACard title="实时训练信息">
          <ATextarea
            v-model:value="textareaValue"
            :disabled="false"
            placeholder="Basic usage"
            :rows="30"
          />
        </ACard>
      </ACol>
      <ACol :span="6" :offset="1">
        <ACard title="数据下载">
          <template #extra><span style="color: gray; opacity: 0.3"></span></template>
          数据包括训练的模型和图片等
        </ACard>
      </ACol>
    </ARow>
  </PageWrapper>
</template>
<script lang="ts" setup>
  import { h, reactive, watch, ref } from 'vue';
  import { PageWrapper } from '/@/components/Page';
  import { useRoute } from 'vue-router';
  import { Description, DescItem, useDescription } from '/@/components/Description/index';
  import { CAV, DOC_URL, DOC_FRONTEND_URL, DOC_BACKEND_URL } from '/@/settings/siteSetting';

  const route = useRoute();

  let textareaValue = ref('');

  const commonLinkRender = (text: string) => (href) => h('a', { href, target: '_blank' }, text);
  const [infoRegister] = useDescription({
    title: '项目信息',
    data: {
      cav: CAV,
      doc_front: DOC_FRONTEND_URL,
      doc_back: DOC_BACKEND_URL,
      doc: DOC_URL,
    },
    schema: [
      {
        label: '本原型工具所属论文(CAV 2022,CCF A)',
        field: 'cav',
        render: commonLinkRender('Trainify论文'),
      },
      {
        label: 'Trainify-proto(Python包)文档地址/Github',
        field: 'doc',
        render: commonLinkRender('Trainify-proto文档'),
      },
      {
        label: '抽象学习验证平台(本平台)前端文档地址/Github',
        field: 'doc_front',
        render: commonLinkRender('文档'),
      },
      {
        label: '抽象学习验证平台(本平台)后端文档地址/Github',
        field: 'doc_back',
        render: commonLinkRender('文档'),
      },
    ],
    column: 2,
  });
</script>
