<template>
  <PageWrapper title="关于Trainify原型工具">
    <template #headerContent>
      <div>
        <div>本原型工具主要包含两部分:</div>
        <div
          >第一部分是已经发表的 CAV 2022(CCF A)中 Trainify: A CEGAR-Driven Training and Verification
          Framework for Safe Deep Reinforcement Learning
          的原型工具,占整个原型工具的主要部分，Trainify-proto
          在论文代码的基础上进行了重构改进，增强了易用性、可拓展性和通用性，实现了深度强化学习
          的自定义抽象训练流程和自选形式化验证等功能。
        </div>
        <div
          >第二部分是正在审稿中的针对 DRL 系统进行可达性分析的 BBReach
          工具，通过对可达性分析问题提出
          了自己的抽象方法，由于都采用了抽象深度强化学习技术，故该部分以一个核心 Python 模块的形式集
          成进了 Trainify-proto 原型工具中。</div
        >
      </div>
    </template>
    <Description @register="infoRegister" class="enter-y" />
  </PageWrapper>
</template>
<script lang="ts" setup>
  import { h } from 'vue';
  import { Tag } from 'ant-design-vue';
  import { PageWrapper } from '/@/components/Page';

  import { Description, DescItem, useDescription } from '/@/components/Description/index';
  import { CAV, DOC_URL, DOC_FRONTEND_URL, DOC_BACKEND_URL } from '/@/settings/siteSetting';

  const commonLinkRender = (text: string) => (href) => h('a', { href, target: '_blank' }, text);
  const infoSchema = [
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
  ];

  const infoData = {
    cav: CAV,
    doc_front: DOC_FRONTEND_URL,
    doc_back: DOC_BACKEND_URL,
    doc: DOC_URL,
  };

  const [infoRegister] = useDescription({
    title: '项目信息',
    data: infoData,
    schema: infoSchema,
    column: 2,
  });
</script>
