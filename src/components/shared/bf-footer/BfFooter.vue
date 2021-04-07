<template>
  <div class="bf-footer">
    <ul>
      <li>
        <a
          class="termsLink"
          href="https://www.blackfynn.com/terms"
          target="_blank"
        >
          Terms
        </a>
      </li>
      <li>
        <a
          class="privacyLink"
          href="https://www.blackfynn.com/privacy"
          target="_blank"
        >
          Privacy
        </a>
      </li>
      <li class="copyrightInfo">
        &copy; {{ copyrightYear }} Pennsieve, Inc.
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  name: 'BfFooter',
  computed: {
    copyrightYear: function() {
      return new Date().getFullYear()
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../../../assets/_variables.scss';

.bf-footer {
  background: $white-matter;
  display: block;
  font-size: 13px;
  padding: 0 0 20px 0;
  z-index: 2;
}

ul {
  display: flex;
  flex-direction: row;
  list-style: none;
  margin: 0;
  padding: 0;
}

li {
  margin-left: 5px;
}

li:first-child {
  margin-left: 0;
}

li:first-child:after {
  content: '+';
  display: inline-block;
  margin-left: 5px;
}

a {
  color: $glial;
}

a:hover {
  color: $primary-color;
}
</style>


