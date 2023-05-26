<template>
  <div class="file-operations">
    <el-button type="primary" @click="handleClick"
      ><el-icon><DocumentAdd /></el-icon>选择文件</el-button
    >
    <template v-if="multipleSelection.length > 0">
      <el-button
        style="width: 90px"
        v-show="canAllStart > 0"
        type="primary"
        plain
        @click="handleStart(multipleSelection)"
        >开始({{ canAllStart }})</el-button
      >
      <el-button style="width: 90px" v-show="canAllStop > 0" type="danger" plain @click="handleStop(multipleSelection)"
        >停止({{ canAllStop }})</el-button
      >
      <el-button style="width: 90px" type="danger" plain @click="handleClear(multipleSelection)"
        >清除({{ multipleSelection.length }})</el-button
      >
    </template>
    <el-button
      style="margin-left: auto"
      :disabled="multipleSelection.length > 0 || canAllStart === 0"
      type="primary"
      plain
      @click="handleStart(multipleSelection)"
      >全部开始</el-button
    >
    <el-button
      :disabled="multipleSelection.length > 0 || canAllStop === 0"
      type="danger"
      plain
      @click="handleStop(multipleSelection)"
      >全部停止</el-button
    >
  </div>
</template>

<script setup>
const props = defineProps({
  multipleSelection: {type: Array, default: () => []},
  canAllStart: {type: Number, default: 0},
  canAllStop: {type: Number, default: 0},
  handleClick: {type: Function, default: () => {}},
  handleClear: {type: Function, default: () => {}},
  handleStart: {type: Function, default: () => {}},
  handleStop: {type: Function, default: () => {}}
});
</script>
<style lang="scss" scoped>
.file-operations {
  display: flex;
  padding: 20px 0px;
}
</style>
