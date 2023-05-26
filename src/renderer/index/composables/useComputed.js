import {computed} from 'vue';

export default function useComputed({multipleSelection, fileList}) {
  const canAllStart = computed(() => {
    const arr = multipleSelection.value.length > 0 ? multipleSelection.value : fileList.value;
    return arr.filter((item) => item.status === 3).length;
  });
  const canAllStop = computed(() => {
    const arr = multipleSelection.value.length > 0 ? multipleSelection.value : fileList.value;
    return arr.filter((item) => item.status === 1 || item.status === 0).length;
  });
  return {canAllStart, canAllStop};
}
