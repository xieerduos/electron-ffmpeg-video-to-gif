<template>
  <el-table
    v-bind="$attrs"
    v-on="$attrs"
    ref="tableRef"
    :row-key="(row) => row.path"
    height="calc(100vh - 160px)"
    style="width: 100%">
    <el-table-column type="selection" reserve-selection width="55" />
    <el-table-column prop="id" label="#" width="50" />
    <el-table-column prop="startTime" label="日期" width="115px">
      <template #default="scope">
        {{ scope.row.startTime ? dayjs(scope.row.startTime).format('YYYY/MM/DD HH:mm:ss') : '' }}
      </template>
    </el-table-column>
    <el-table-column prop="name" label="文件名称">
      <template #default="scope">
        <span class="file-name" @click="handleShowRowFolder(scope.row.path)" :title="scope.row.path">{{
          scope.row.name
        }}</span>
      </template>
    </el-table-column>
    <el-table-column prop="size" label="大小" width="100px">
      <template #default="scope">
        {{ bytes(scope.row.size) }}
      </template>
    </el-table-column>
    <el-table-column prop="status" label="状态" align="center" width="100px">
      <template #default="scope">
        <el-tag class="ml-2" :type="MAP_STATUS.get(scope.row.status).tag">{{
          MAP_STATUS.get(scope.row.status).text
        }}</el-tag>
      </template>
    </el-table-column>
    <el-table-column prop="progress" label="完成进度" align="left">
      <template #default="scope">
        <div class="progress-wrap">
          <el-progress :percentage="scope.row.progress" :format="(percentage) => percentage.toFixed(1) + '%'" />
        </div>
      </template>
    </el-table-column>
    <el-table-column prop="" label="操作" align="center" width="100px">
      <template #default="scope">
        <el-button
          @click="handleResultFolder(scope.row)"
          :disabled="scope.row.status !== 2"
          text
          :title="scope.row.path"
          ><el-icon><Folder /></el-icon
        ></el-button>
      </template>
    </el-table-column>
  </el-table>
  <p>总计：{{ total }} 条数据</p>
</template>
<script setup>
import {ref} from 'vue';
import dayjs from 'dayjs';
import useElectron from '@/renderer/index/composables/useElectron.js';
import {MAP_STATUS} from '@/renderer/index/utils/constant.js';
import bytes from 'bytes';
const tableRef = ref();

const props = defineProps({
  total: {type: Number, required: true, default: 0}
});

const {handleResultFolder, handleShowRowFolder} = useElectron();

defineExpose({
  getTableRef: () => tableRef.value
});
</script>
<style lang="scss" scoped>
.file-name {
  cursor: pointer;
}
.progress-wrap ::v-deep(.el-progress__text) {
  width: 60px;
  font-size: 12px;
}
</style>
