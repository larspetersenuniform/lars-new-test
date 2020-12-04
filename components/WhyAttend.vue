<template>
  <section class="bg-white border-b py-8">
    <div class="container mx-auto flex flex-wrap pt-4 pb-12">
      <div class="w-1/2">
        <img v-if="imageUrl" :src="imageUrl" class="p-10" />
      </div>
      <div class="w-1/2">
        <div class="p-10">
          <h2 class="w-full my-2 text-4xl font-bold leading-tight text-center text-gray-800">
            {{ fields.title }}
          </h2>
          <hr />
          <p class="text-gray-800 p-10 whitespace-pre-line">{{ fields.description }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: 'WhyAttend',
  props: {
    fields: {
      type: Object,
      default() {
        return {
          image: {},
          title: '',
          description: '',
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
    imageUrl() {
      return this.fields.image?.fields?.file?.url;
    },
  },
};
</script>
