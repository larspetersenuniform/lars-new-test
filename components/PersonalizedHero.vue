<template>
  <div>
    <Personalize :variations="variations" tracking-event-name="heroPersonalized" />
  </div>
</template>
<script>
import { Personalize } from '@uniformdev/optimize-tracker-vue';
import { contentfulOptimizeListReader } from '@uniformdev/optimize-tracker-contentful';
export default {
  name: 'PersonalizedHero',
  components: {
    Personalize,
  },
  props: {
    fields: {
      type: Object,
      default() {
        return {
          unfrmOptP13nList: {},
        };
      },
    },
    sys: {
      type: Object,
      default() {
        return {};
      },
    },
  },
  computed: {
    variations() {
      return contentfulOptimizeListReader(this.fields.unfrmOptP13nList);
    },
  },
};
</script>
