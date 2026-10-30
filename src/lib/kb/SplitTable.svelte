<script lang="ts">
  import reports from '#lib/data/reports.json';
  import tenants from '#lib/data/tenants.json';
  import oneDayIds from '#lib/data/one-day-ids.json';
  import source from '#lib/data/source.json';

  type Problem = 'parser' | 'hint' | 'one-day';
  const tenantById = new Map(tenants.map((tenant) => [tenant.id, tenant]));
  const oneDay = new Set(oneDayIds);
  const rows = reports.map((report) => {
    const tenant = tenantById.get(report.tenant);
    const kbCause = !tenant || !tenant.dayFirst
      ? 'unplaced'
      : report.channel === 'form' && tenant.form === 'booking-v3'
        ? 'hint'
        : 'parser';
    return { ...report, kbCause };
  });

  const names: Problem[] = ['parser', 'hint', 'one-day'];
  const rules: Record<Problem, string> = {
    parser: 'Day-first tenant; not a booking-v3 form entry. Includes the five documented one-day moves, as filed by the desk.',
    hint: 'Booking-v3 form entry from a day-first tenant; the form hint and parser use opposite date orders.',
    'one-day': 'Identified separately in the desk notes; these five reports are also counted under parser, not additional reports.',
  };
  const groups = names.map((problem) => {
    const items = rows.filter((report) => problem === 'one-day'
      ? oneDay.has(report.id)
      : report.kbCause === problem);
    const dates = items.map((report) => report.receivedAt).sort();
    const counts = (key: 'channel' | 'intakeTag') =>
      Object.entries(items.reduce<Record<string, number>>((acc, report) => {
        acc[report[key]] = (acc[report[key]] ?? 0) + 1;
        return acc;
      }, {})).sort(([a], [b]) => a.localeCompare(b));
    return {
      problem,
      rule: rules[problem],
      count: items.length,
      tenants: new Set(items.map((report) => report.tenant)).size,
      first: dates[0],
      last: dates.at(-1),
      channels: counts('channel'),
      tags: counts('intakeTag'),
    };
  });
  const kbTagDisagreements = rows.filter((report) => report.intakeTag !== report.kbCause).length;
  const bodyKinds = Object.entries(rows.reduce<Record<string, number>>((acc, report) => {
    acc[report.bodyKind] = (acc[report.bodyKind] ?? 0) + 1;
    return acc;
  }, {})).sort(([a], [b]) => a.localeCompare(b));
  const duplicates = source.exportRows - reports.length;
</script>

<p class="sum"><strong>{source.exportRows}</strong> export rows · <strong>{reports.length}</strong> unique reports · <strong>{duplicates}</strong> duplicate rows removed by report ID.</p>

<table>
  <thead>
    <tr><th>problem</th><th>reports</th><th>tenants</th><th>channels</th><th>intake tags</th><th>first → last seen</th></tr>
  </thead>
  <tbody>
    {#each groups as group (group.problem)}
      <tr>
        <td><strong>{group.problem}</strong><br /><span class="rule">{group.rule}</span></td>
        <td>{group.count}</td>
        <td>{group.tenants}</td>
        <td>{group.channels.map(([name, count]) => `${name} ×${count}`).join(' · ')}</td>
        <td>{group.tags.map(([name, count]) => `${name} ×${count}`).join(' · ')}</td>
        <td>{group.first} → {group.last}</td>
      </tr>
    {/each}
  </tbody>
</table>

<p class="note">The parser and hint groups cover all {reports.length} unique reports. The five one-day reports overlap the parser group; do not add them again. Intake disagrees with the KB's parser/hint rule for {kbTagDisagreements} reports. Body reading: {bodyKinds.map(([name, count]) => `${name} ${count}`).join(' · ')}.</p>

<style>
  .sum { font-size: 1.05rem; }
  .rule, .note { color: var(--muted); font-size: 0.88em; }
  .note { margin-top: 1rem; }
</style>
