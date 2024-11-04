<script lang="ts">
  import { page } from '$app/stores'
  import type { SVGAttributes } from 'svelte/elements'

  export let href: string
  export let name: string
  export let viewBox: string

  $: currentPage = `/${$page.url.pathname.split('/')[1]}`

  const svgIconParams: SVGAttributes<any> = { height: 24, width: 24, xmlns: 'http://www.w3.org/2000/svg' }
</script>

<a {href} class:active={currentPage === href}>
  <svg {viewBox} {...svgIconParams} class="mobile-only">
    <slot />
  </svg>
  <span>{name}</span>
</a>

<style>
  a {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
    color: inherit;
    font-size: 0.9rem;
    font-weight: 500;
    text-decoration: none;
  }

  a.active {
    color: #fff;
  }

  svg :global(path) {
    fill: #fff;
  }

  a.active > svg :global(path) {
    fill: var(--pt-teal-dark);
  }

  @media (min-width: 48rem) {
    a.active {
      color: #fff;
    }

    a:not(.active):hover > span {
      color: #fff;
    }
  }
</style>
