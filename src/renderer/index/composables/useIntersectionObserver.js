import {watch, nextTick, ref, onBeforeUnmount} from 'vue';

function useIntersectionObserver({tableData, tableRef, loadMoreCallback}) {
  const observers = ref([]);

  const disconnectObservers = () => {
    console.log('disconnecting observers', observers.value);
    observers.value.forEach((observer) => observer.disconnect());
    observers.value = [];
  };

  watch(
    () => tableData.value,
    (values) => {
      nextTick(() => {
        disconnectObservers();

        if (values.length === 0) {
          return;
        }

        nextTick(() => {
          const lastItem = values[values.length - 1];
          console.log('lastItem', lastItem);
          const lastSelector = `[data-id="${lastItem.id}"]`;
          const lastRow = document.querySelector(lastSelector);

          // console.log('lastRow', lastRow);

          const observer = new IntersectionObserver((entries) => {
            if (!(Array.isArray(entries) && entries.length > 0)) {
              return;
            }
            const [entry] = entries;
            if (entry.isIntersecting) {
              // 调用回调函数处理加载更多
              loadMoreCallback(lastItem, lastRow);
            }
          });

          lastRow && observer.observe(lastRow);
          observers.value.push(observer);
        });
      });
    },
    {
      immediate: true
    }
  );
  onBeforeUnmount(() => {
    // 组件销毁时停止观察
    disconnectObservers();
  });
}

export default useIntersectionObserver;
