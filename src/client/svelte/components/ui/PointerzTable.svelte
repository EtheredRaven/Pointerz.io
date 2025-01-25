<script>
  export let columns = [];
  export let values = [];
  export let highlightedStyle =
    "background:var(--dark-blue-shadow-color);color:var(--almost-white-color);";
</script>

<table>
  {#if values.length > 0}
    {#each values as val}
      <tr style={val.highlighted ? highlightedStyle : ""}>
        {#each columns as column}
          <td style={column.style}>
            {@html val[column.name]}
          </td>
        {/each}
      </tr>
    {/each}
  {:else}There is no ranking{/if}
</table>

<style>
  table {
    width: 100%;
    white-space: nowrap;
    border-collapse: collapse;
    table-layout: fixed;
  }

  table td {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    padding-top: 4px;
    padding-bottom: 4px;
  }

  tr td:first-child {
    border-top-left-radius: 8px;
    border-bottom-left-radius: 8px;
    padding-left: 8px;
  }

  tr td:last-child {
    border-top-right-radius: 8px;
    border-bottom-right-radius: 8px;
    padding-right: 8px;
  }
</style>
