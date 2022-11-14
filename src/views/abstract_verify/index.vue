<template>
  <PageWrapper title="抽象训练与验证" content="请按照指导输入数据">
    <template #left>left</template>
    <template #right>right</template>
  </PageWrapper>
</template>

<script lang="ts">
  import { PageWrapper } from '/@/components/Page';
  import { defineComponent } from 'vue';
  export default defineComponent({
    components: { PageWrapper },
    setup() {
      return {};
    },
  });
</script>
