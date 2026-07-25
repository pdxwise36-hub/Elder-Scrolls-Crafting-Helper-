/*
 * ESO Crafting Helper — application logic
 * Vanilla JS, persists to localStorage. No build step, no dependencies.
 */
(function () {
  "use strict";

  var STORAGE_KEY = "eso-crafting-helper-v1";
  var HOUR_MS = 3600 * 1000;

  // ----- State ------------------------------------------------------------
  // known:  { "craftId|item|Trait": true }        -> researched/known traits
  // active: [ { id, craft, group, item, trait, kind, start, durationMs } ]
  // settings: { passive: {craftId: rank}, esoPlus: bool, otherReduction: % }
  var defaultState = {
    known: {},
    active: [],
    plan: [], // shopping list: [{ craft, item, trait }]
    settings: {
      passive: { blacksmithing: 4, clothing: 4, woodworking: 4, jewelry: 4 },
      esoPlus: false,
      otherReduction: 0
    }
  };

  var state = load();

  function load() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return clone(defaultState);
      var parsed = JSON.parse(raw);
      // merge defensively so older saves keep working
      return {
        known: parsed.known || {},
        active: parsed.active || [],
        plan: parsed.plan || [],
        settings: Object.assign(clone(defaultState.settings), parsed.settings || {})
      };
    } catch (e) {
      return clone(defaultState);
    }
  }

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      /* storage might be unavailable; app still works for the session */
    }
  }

  function clone(o) {
    return JSON.parse(JSON.stringify(o));
  }

  // ----- Lookups ----------------------------------------------------------
  function craftById(id) {
    return ESO.CRAFTS.filter(function (c) { return c.id === id; })[0];
  }

  function groupFor(craft, item) {
    for (var i = 0; i < craft.groups.length; i++) {
      if (craft.groups[i].items.indexOf(item) !== -1) return craft.groups[i];
    }
    return null;
  }

  function traitKey(craftId, item, trait) {
    return craftId + "|" + item + "|" + trait;
  }

  function isKnown(craftId, item, trait) {
    return !!state.known[traitKey(craftId, item, trait)];
  }

  function isResearching(craftId, item, trait) {
    return state.active.some(function (a) {
      return a.craft === craftId && a.item === item && a.trait === trait;
    });
  }

  // Count traits already secured (known) for an item — this determines the
  // base time for the *next* research on that item.
  function knownCount(craftId, item) {
    var craft = craftById(craftId);
    var group = groupFor(craft, item);
    var traits = ESO.traitsFor(group.traits);
    var n = 0;
    for (var i = 0; i < traits.length; i++) {
      if (isKnown(craftId, item, traits[i].name)) n++;
    }
    return n;
  }

  // Total reduction multiplier: passive * ESO Plus * other, all multiplicative.
  function reductionMultiplier(craftId) {
    var rank = state.settings.passive[craftId] || 0;
    var passive = ESO.PASSIVE_RANKS[rank] || ESO.PASSIVE_RANKS[0];
    var mult = 1 - passive.reduction;
    if (state.settings.esoPlus) mult *= 1 - ESO.ESO_PLUS_REDUCTION;
    var other = Math.max(0, Math.min(100, Number(state.settings.otherReduction) || 0));
    mult *= 1 - other / 100;
    return mult;
  }

  function slotsFor(craftId) {
    var rank = state.settings.passive[craftId] || 0;
    return (ESO.PASSIVE_RANKS[rank] || ESO.PASSIVE_RANKS[0]).slots;
  }

  function activeCountForCraft(craftId) {
    return state.active.filter(function (a) { return a.craft === craftId; }).length;
  }

  // Effective duration (ms) for researching the `nextIndex`-th trait
  // (nextIndex = knownCount + 1) of the given craft.
  function effectiveDurationMs(craftId, nextIndex) {
    var base = ESO.baseResearchHours(nextIndex); // hours
    return base * reductionMultiplier(craftId) * HOUR_MS;
  }

  // ----- Time formatting --------------------------------------------------
  function fmtDuration(ms) {
    if (ms <= 0) return "Ready";
    var totalSec = Math.floor(ms / 1000);
    var d = Math.floor(totalSec / 86400);
    var h = Math.floor((totalSec % 86400) / 3600);
    var m = Math.floor((totalSec % 3600) / 60);
    var s = totalSec % 60;
    var parts = [];
    if (d) parts.push(d + "d");
    if (h || d) parts.push(h + "h");
    parts.push(m + "m");
    if (!d) parts.push(s + "s");
    return parts.join(" ");
  }

  function fmtHours(hours) {
    if (hours >= 24) {
      var days = hours / 24;
      var rounded = Math.round(days * 10) / 10;
      return rounded + (rounded === 1 ? " day" : " days");
    }
    var r = Math.round(hours * 10) / 10;
    return r + (r === 1 ? " hour" : " hours");
  }

  function fmtDateTime(ts) {
    var dt = new Date(ts);
    return dt.toLocaleString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit"
    });
  }

  // ----- Rendering: tabs --------------------------------------------------
  function showTab(id) {
    document.querySelectorAll(".panel").forEach(function (p) {
      p.classList.toggle("active", p.id === "panel-" + id);
    });
    document.querySelectorAll("nav.tabs button").forEach(function (b) {
      b.classList.toggle("active", b.dataset.tab === id);
    });
  }

  // ----- Rendering: the "start research" form -----------------------------
  var formState = { craft: "blacksmithing", item: null, trait: null };

  function renderForm() {
    var craft = craftById(formState.craft);

    // Craft select
    var craftSel = document.getElementById("f-craft");
    craftSel.innerHTML = ESO.CRAFTS.map(function (c) {
      return '<option value="' + c.id + '">' + c.name + "</option>";
    }).join("");
    craftSel.value = formState.craft;

    // Item select (grouped)
    var itemSel = document.getElementById("f-item");
    itemSel.innerHTML = craft.groups
      .map(function (g) {
        var opts = g.items
          .map(function (it) {
            var kc = knownCount(craft.id, it);
            return '<option value="' + it + '">' + it + " (" + kc + "/9)</option>";
          })
          .join("");
        return '<optgroup label="' + g.name + '">' + opts + "</optgroup>";
      })
      .join("");
    if (!formState.item || !groupFor(craft, formState.item)) {
      formState.item = craft.groups[0].items[0];
    }
    itemSel.value = formState.item;

    // Trait select — only traits not yet known and not already researching
    var group = groupFor(craft, formState.item);
    var traits = ESO.traitsFor(group.traits);
    var available = traits.filter(function (t) {
      return !isKnown(craft.id, formState.item, t.name) &&
        !isResearching(craft.id, formState.item, t.name);
    });
    var traitSel = document.getElementById("f-trait");
    traitSel.innerHTML = available
      .map(function (t) { return '<option value="' + t.name + '">' + t.name + "</option>"; })
      .join("");
    if (available.length === 0) {
      traitSel.innerHTML = '<option value="">— none available —</option>';
      formState.trait = null;
    } else if (!formState.trait || !available.some(function (t) { return t.name === formState.trait; })) {
      formState.trait = available[0].name;
    }
    if (formState.trait) traitSel.value = formState.trait;

    // Preview of duration
    var nextIndex = knownCount(craft.id, formState.item) + 1;
    var baseHours = ESO.baseResearchHours(nextIndex);
    var effMs = effectiveDurationMs(craft.id, nextIndex);
    var preview = document.getElementById("f-preview");
    var slots = slotsFor(craft.id);
    var used = activeCountForCraft(craft.id);
    var slotWarn = used >= slots
      ? ' <span style="color:var(--red)">· ' + used + "/" + slots + " research slots in use</span>"
      : ' <span class="faint">· ' + used + "/" + slots + " slots used</span>";

    if (available.length === 0) {
      preview.innerHTML =
        '<span class="muted">All traits for ' + formState.item +
        " are researched or in progress.</span>";
    } else {
      preview.innerHTML =
        "Researching trait <strong>#" + nextIndex + "</strong> on " +
        formState.item + ": base " + fmtHours(baseHours) +
        ' &rarr; <span class="pill">' + fmtHours(effMs / HOUR_MS) + "</span>" +
        slotWarn;
    }

    var btn = document.getElementById("f-start");
    btn.disabled = available.length === 0 || !formState.trait;
  }

  function startResearch() {
    var craft = craftById(formState.craft);
    if (!formState.trait) return;
    var group = groupFor(craft, formState.item);
    var nextIndex = knownCount(craft.id, formState.item) + 1;
    var durationMs = effectiveDurationMs(craft.id, nextIndex);
    var now = Date.now();
    state.active.push({
      id: "r" + now + "-" + Math.floor(Math.random() * 1e6),
      craft: craft.id,
      group: group.name,
      item: formState.item,
      trait: formState.trait,
      kind: group.traits,
      traitIndex: nextIndex,
      start: now,
      durationMs: durationMs
    });
    formState.trait = null;
    save();
    renderForm();
    renderActive();
    renderMatrix();
  }

  // ----- Rendering: active research list ----------------------------------
  function renderActive() {
    var list = document.getElementById("active-list");
    if (state.active.length === 0) {
      list.innerHTML = '<div class="empty">No research in progress. Start one above.</div>';
      updateCountdowns();
      return;
    }
    // sort by soonest completion first
    var sorted = state.active.slice().sort(function (a, b) {
      return a.start + a.durationMs - (b.start + b.durationMs);
    });
    list.innerHTML = sorted
      .map(function (a) {
        var craft = craftById(a.craft);
        var end = a.start + a.durationMs;
        return (
          '<div class="timer" data-id="' + a.id + '" data-end="' + end +
          '" data-start="' + a.start + '" data-dur="' + a.durationMs + '">' +
          '<div class="timer-top">' +
          "<div>" +
          '<div class="timer-title">' + a.trait + " &mdash; " + a.item + "</div>" +
          '<div class="timer-sub">' + craft.name + " · " + a.group +
          " · trait #" + (a.traitIndex || "?") +
          " · finishes " + fmtDateTime(end) + "</div>" +
          "</div>" +
          '<div class="timer-remaining" data-role="remaining">…</div>' +
          "</div>" +
          '<div class="progress"><span data-role="bar" style="width:0%"></span></div>' +
          '<div class="timer-actions">' +
          '<button class="btn sm" data-action="complete" data-id="' + a.id +
          '">Mark researched</button>' +
          '<button class="btn ghost sm" data-action="cancel" data-id="' + a.id +
          '">Cancel</button>' +
          "</div>" +
          "</div>"
        );
      })
      .join("");
    updateCountdowns();
  }

  function updateCountdowns() {
    var now = Date.now();
    document.querySelectorAll(".timer").forEach(function (el) {
      var end = Number(el.dataset.end);
      var start = Number(el.dataset.start);
      var dur = Number(el.dataset.dur);
      var remaining = end - now;
      var remEl = el.querySelector('[data-role="remaining"]');
      var bar = el.querySelector('[data-role="bar"]');
      var pct = dur > 0 ? Math.max(0, Math.min(100, ((now - start) / dur) * 100)) : 100;
      bar.style.width = pct.toFixed(1) + "%";
      if (remaining <= 0) {
        el.classList.add("done");
        remEl.classList.add("done");
        bar.classList.add("done");
        remEl.textContent = "Ready ✓";
      } else {
        remEl.textContent = fmtDuration(remaining);
      }
    });
  }

  function completeResearch(id, markKnown) {
    var idx = -1;
    for (var i = 0; i < state.active.length; i++) {
      if (state.active[i].id === id) { idx = i; break; }
    }
    if (idx === -1) return;
    var job = state.active[idx];
    state.active.splice(idx, 1);
    if (markKnown) {
      state.known[traitKey(job.craft, job.item, job.trait)] = true;
    }
    save();
    renderActive();
    renderForm();
    renderMatrix();
    renderPlanForm();
    renderPlan();
  }

  // ----- Rendering: trait tracker matrix ----------------------------------
  function renderMatrix() {
    var wrap = document.getElementById("matrix-wrap");
    var selCraft = document.getElementById("m-craft").value;
    var craft = craftById(selCraft);

    var html = "";
    craft.groups.forEach(function (group) {
      var traits = ESO.traitsFor(group.traits);
      html += '<table class="matrix"><thead><tr>';
      html += '<tr class="group-row"><th colspan="' + (traits.length + 2) +
        '">' + craft.name + " · " + group.name + "</th></tr>";
      html += '<th class="item-col">Item</th>';
      traits.forEach(function (t) {
        html += '<th title="' + t.effect + '">' + t.name + "</th>";
      });
      html += "<th>Known</th></tr></thead><tbody>";

      group.items.forEach(function (item) {
        html += "<tr>";
        html += '<th class="item-col">' + item + "</th>";
        var kc = 0;
        traits.forEach(function (t) {
          var known = isKnown(craft.id, item, t.name);
          var researching = isResearching(craft.id, item, t.name);
          if (known) kc++;
          var cls = researching ? ' class="researching"' : "";
          var title = researching ? ' title="Currently researching"' : "";
          html += "<td" + cls + title + '>' +
            '<input type="checkbox" data-craft="' + craft.id +
            '" data-item="' + item + '" data-trait="' + t.name + '"' +
            (known ? " checked" : "") + " /></td>";
        });
        html += '<td class="count">' + kc + "/" + traits.length + "</td>";
        html += "</tr>";
      });
      html += "</tbody></table>";
    });
    wrap.innerHTML = html;
  }

  // ----- Rendering: settings ----------------------------------------------
  function renderSettings() {
    var wrap = document.getElementById("passive-settings");
    wrap.innerHTML = ESO.CRAFTS.map(function (c) {
      var rank = state.settings.passive[c.id] || 0;
      var opts = [0, 1, 2, 3, 4]
        .map(function (r) {
          var p = ESO.PASSIVE_RANKS[r];
          var lbl = r === 0
            ? "Rank 0 — none (0%, 1 slot)"
            : "Rank " + r + " — " + Math.round(p.reduction * 100) + "%, " + p.slots + " slots";
          return '<option value="' + r + '"' + (r === rank ? " selected" : "") + ">" + lbl + "</option>";
        })
        .join("");
      return (
        '<label class="field"><span>' + c.name + " &mdash; " + c.passive + "</span>" +
        '<select data-craft="' + c.id + '" class="passive-sel">' + opts + "</select></label>"
      );
    }).join("");

    document.getElementById("s-esoplus").checked = !!state.settings.esoPlus;
    document.getElementById("s-other").value = state.settings.otherReduction || 0;
    renderReductionSummary();
  }

  function renderReductionSummary() {
    var sum = document.getElementById("reduction-summary");
    sum.innerHTML = ESO.CRAFTS.map(function (c) {
      var mult = reductionMultiplier(c.id);
      var pct = Math.round((1 - mult) * 100);
      return '<div class="row-between"><span>' + c.name +
        "</span><span class=\"pill\">−" + pct + "% · " + slotsFor(c.id) + " slots</span></div>";
    }).join("");
  }

  // ----- Research Plan (the "shopping list") ------------------------------
  var planForm = { craft: "blacksmithing", item: null, trait: null };

  function planHas(craftId, item, trait) {
    return state.plan.some(function (t) {
      return t.craft === craftId && t.item === item && t.trait === trait;
    });
  }

  // Traits that are valid to add for an item: not already known, not already listed.
  function addableTraits(craftId, item) {
    var craft = craftById(craftId);
    var group = groupFor(craft, item);
    return ESO.traitsFor(group.traits).filter(function (t) {
      return !isKnown(craftId, item, t.name) && !planHas(craftId, item, t.name);
    });
  }

  function renderPlanForm() {
    var craft = craftById(planForm.craft);

    var craftSel = document.getElementById("p-craft");
    craftSel.innerHTML = ESO.CRAFTS.map(function (c) {
      return '<option value="' + c.id + '">' + c.name + "</option>";
    }).join("");
    craftSel.value = planForm.craft;

    var itemSel = document.getElementById("p-item");
    itemSel.innerHTML = craft.groups
      .map(function (g) {
        var opts = g.items
          .map(function (it) { return '<option value="' + it + '">' + it + "</option>"; })
          .join("");
        return '<optgroup label="' + g.name + '">' + opts + "</optgroup>";
      })
      .join("");
    if (!planForm.item || !groupFor(craft, planForm.item)) {
      planForm.item = craft.groups[0].items[0];
    }
    itemSel.value = planForm.item;

    var avail = addableTraits(craft.id, planForm.item);
    var traitSel = document.getElementById("p-trait");
    if (avail.length === 0) {
      traitSel.innerHTML = '<option value="">— all added or known —</option>';
      planForm.trait = null;
    } else {
      traitSel.innerHTML = avail
        .map(function (t) { return '<option value="' + t.name + '">' + t.name + "</option>"; })
        .join("");
      if (!planForm.trait || !avail.some(function (t) { return t.name === planForm.trait; })) {
        planForm.trait = avail[0].name;
      }
      traitSel.value = planForm.trait;
    }
    document.getElementById("p-add").disabled = avail.length === 0;

    // convenience: "add all remaining traits for this item"
    var allBtn = document.getElementById("p-add-all");
    allBtn.disabled = avail.length === 0;
    allBtn.textContent = avail.length
      ? "Add all " + avail.length + " remaining"
      : "Nothing to add";
  }

  function addTarget(all) {
    var craft = craftById(planForm.craft);
    var traits = all
      ? addableTraits(craft.id, planForm.item).map(function (t) { return t.name; })
      : (planForm.trait ? [planForm.trait] : []);
    traits.forEach(function (name) {
      if (!planHas(craft.id, planForm.item, name)) {
        state.plan.push({ craft: craft.id, item: planForm.item, trait: name });
      }
    });
    planForm.trait = null;
    save();
    renderPlanForm();
    renderPlan();
  }

  function removeTarget(craftId, item, trait) {
    state.plan = state.plan.filter(function (t) {
      return !(t.craft === craftId && t.item === item && t.trait === trait);
    });
    save();
    renderPlanForm();
    renderPlan();
  }

  function clearPlan() {
    if (state.plan.length && !confirm("Clear your whole research list?")) return;
    state.plan = [];
    save();
    renderPlanForm();
    renderPlan();
  }

  // Schedule the listed targets across each craft's research slots to finish
  // in the least total time. Research on one item is sequential (one trait at
  // a time); slots let different items in the same craft run in parallel.
  // Uses list scheduling with a "most work remaining first" priority — a fast,
  // near-optimal makespan heuristic. Assumes you start now with all slots free.
  function buildPlan() {
    var byCraft = {};
    state.plan.forEach(function (t) {
      (byCraft[t.craft] = byCraft[t.craft] || []).push(t);
    });

    var out = { crafts: [], overallMs: 0, totalSteps: 0, sequentialMs: 0 };

    ESO.CRAFTS.forEach(function (craft) {
      var targets = byCraft[craft.id];
      if (!targets || !targets.length) return;

      var perHourMs = reductionMultiplier(craft.id) * HOUR_MS;
      var slots = slotsFor(craft.id);

      // group picks by item, tier them from current known count upward
      var itemPicks = {};
      targets.forEach(function (t) {
        (itemPicks[t.item] = itemPicks[t.item] || []).push(t.trait);
      });

      var chains = [];
      Object.keys(itemPicks).forEach(function (item) {
        var known = knownCount(craft.id, item);
        var group = groupFor(craft, item);
        var canonical = ESO.traitsFor(group.traits).map(function (x) { return x.name; });
        var picks = itemPicks[item].slice().sort(function (a, b) {
          return canonical.indexOf(a) - canonical.indexOf(b);
        });
        var researches = picks.map(function (trait, i) {
          var tier = known + 1 + i;
          return { trait: trait, tier: tier, dur: ESO.baseResearchHours(tier) * perHourMs };
        });
        var remaining = researches.reduce(function (s, r) { return s + r.dur; }, 0);
        out.sequentialMs += remaining;
        out.totalSteps += researches.length;
        chains.push({
          item: item,
          group: group.name,
          researches: researches,
          nextIdx: 0,
          remainingWork: remaining,
          busyUntil: 0
        });
      });

      // discrete-event simulation of `slots` parallel machines
      var slotFree = [];
      for (var s = 0; s < slots; s++) slotFree.push(0);
      var steps = [];
      var guard = 0;

      while (guard++ < 20000) {
        var anyLeft = chains.some(function (c) { return c.nextIdx < c.researches.length; });
        if (!anyLeft) break;

        // earliest-free slot
        var sIdx = 0;
        for (var i = 1; i < slots; i++) if (slotFree[i] < slotFree[sIdx]) sIdx = i;
        var t = slotFree[sIdx];

        var avail = chains.filter(function (c) {
          return c.nextIdx < c.researches.length && c.busyUntil <= t;
        });

        if (avail.length === 0) {
          // no item free to research yet — idle this slot until one frees
          var upcoming = chains
            .filter(function (c) { return c.nextIdx < c.researches.length && c.busyUntil > t; })
            .map(function (c) { return c.busyUntil; });
          if (!upcoming.length) break;
          slotFree[sIdx] = Math.min.apply(null, upcoming);
          continue;
        }

        avail.sort(function (a, b) {
          return (
            b.remainingWork - a.remainingWork ||
            b.researches[b.nextIdx].dur - a.researches[a.nextIdx].dur
          );
        });
        var chain = avail[0];
        var r = chain.researches[chain.nextIdx];
        var end = t + r.dur;
        steps.push({
          item: chain.item,
          group: chain.group,
          trait: r.trait,
          tier: r.tier,
          dur: r.dur,
          start: t,
          end: end
        });
        slotFree[sIdx] = end;
        chain.busyUntil = end;
        chain.remainingWork -= r.dur;
        chain.nextIdx++;
      }

      var makespan = steps.reduce(function (m, x) { return Math.max(m, x.end); }, 0);
      steps.sort(function (a, b) { return a.start - b.start || b.dur - a.dur; });
      out.crafts.push({
        id: craft.id,
        name: craft.name,
        passive: craft.passive,
        slots: slots,
        steps: steps,
        makespanMs: makespan
      });
      out.overallMs = Math.max(out.overallMs, makespan);
    });

    return out;
  }

  function fmtOffset(ms) {
    return ms <= 0 ? "now" : "in " + fmtDuration(ms);
  }

  function renderPlan() {
    // ---- the list of chosen targets ----
    var tWrap = document.getElementById("p-targets");
    if (state.plan.length === 0) {
      tWrap.innerHTML =
        '<div class="empty">Your list is empty. Add the traits you want above.</div>';
    } else {
      var groupedByCraft = {};
      state.plan.forEach(function (t) {
        var byItem = (groupedByCraft[t.craft] = groupedByCraft[t.craft] || {});
        (byItem[t.item] = byItem[t.item] || []).push(t.trait);
      });
      var html = "";
      ESO.CRAFTS.forEach(function (craft) {
        var items = groupedByCraft[craft.id];
        if (!items) return;
        html += '<div class="plan-craft"><h3>' + craft.name + "</h3>";
        Object.keys(items).forEach(function (item) {
          html += '<div class="target-row"><span class="target-item">' + item + "</span>";
          html += '<span class="chips">';
          items[item].forEach(function (trait) {
            html +=
              '<span class="chip">' + trait +
              '<button class="chip-x" title="Remove" data-craft="' + craft.id +
              '" data-item="' + item + '" data-trait="' + trait + '">&times;</button></span>';
          });
          html += "</span></div>";
        });
        html += "</div>";
      });
      tWrap.innerHTML = html;
    }

    // ---- the computed schedule ----
    var plan = buildPlan();
    var summary = document.getElementById("p-summary");
    var planWrap = document.getElementById("p-plan");

    if (state.plan.length === 0) {
      summary.innerHTML = "";
      planWrap.innerHTML = "";
      return;
    }

    var overallDone = Date.now() + plan.overallMs;
    summary.innerHTML =
      '<div class="plan-summary">' +
      '<div><span class="big">' + fmtDuration(plan.overallMs) + "</span>" +
      '<span class="lbl">to finish all ' + plan.totalSteps + " researches</span></div>" +
      '<div><span class="big">' + fmtDateTime(overallDone) + "</span>" +
      '<span class="lbl">everything done by</span></div>' +
      '<div><span class="big">' + fmtDuration(plan.sequentialMs) + "</span>" +
      '<span class="lbl">if done one at a time</span></div>' +
      "</div>";

    var body = "";
    plan.crafts.forEach(function (c) {
      var done = Date.now() + c.makespanMs;
      body +=
        '<div class="plan-craft-block">' +
        '<div class="plan-craft-head"><h3>' + c.name + "</h3>" +
        '<span class="pill">' + c.slots + " slots · " + fmtDuration(c.makespanMs) +
        "</span></div>";
      body += '<ol class="plan-steps">';
      c.steps.forEach(function (step) {
        var startAt = Date.now() + step.start;
        var endAt = Date.now() + step.end;
        var startCls = step.start <= 0 ? " ready" : "";
        body +=
          '<li class="plan-step">' +
          '<div class="step-main">' +
          '<span class="step-title">' + step.trait + " &mdash; " + step.item + "</span>" +
          '<span class="step-sub">trait #' + step.tier + " · " + fmtHours(step.dur / HOUR_MS) +
          " · " + step.group + "</span>" +
          "</div>" +
          '<div class="step-time">' +
          '<span class="step-start' + startCls + '">start ' + fmtOffset(step.start) + "</span>" +
          '<span class="step-finish">done ' + fmtDateTime(endAt) + "</span>" +
          "</div>" +
          "</li>";
      });
      body += "</ol></div>";
    });
    planWrap.innerHTML = body;
  }

  // ----- Rendering: reference ---------------------------------------------
  function renderReference() {
    // Research time table
    var timeRows = "";
    for (var n = 1; n <= 9; n++) {
      var base = ESO.baseResearchHours(n);
      timeRows +=
        "<tr><td class=\"num\">#" + n + '</td><td class="num">' + fmtHours(base) +
        "</td></tr>";
    }
    document.getElementById("ref-times").innerHTML = timeRows;

    function traitTable(traits) {
      return traits
        .map(function (t) {
          return '<tr><td class="name">' + t.name + "</td><td>" + t.effect + "</td></tr>";
        })
        .join("");
    }
    document.getElementById("ref-weapon").innerHTML = traitTable(ESO.WEAPON_TRAITS);
    document.getElementById("ref-armor").innerHTML = traitTable(ESO.ARMOR_TRAITS);
    document.getElementById("ref-jewelry").innerHTML = traitTable(ESO.JEWELRY_TRAITS);
  }

  // ----- Event wiring -----------------------------------------------------
  function wire() {
    document.querySelectorAll("nav.tabs button").forEach(function (b) {
      b.addEventListener("click", function () { showTab(b.dataset.tab); });
    });

    document.getElementById("f-craft").addEventListener("change", function (e) {
      formState.craft = e.target.value;
      formState.item = null;
      formState.trait = null;
      renderForm();
    });
    document.getElementById("f-item").addEventListener("change", function (e) {
      formState.item = e.target.value;
      formState.trait = null;
      renderForm();
    });
    document.getElementById("f-trait").addEventListener("change", function (e) {
      formState.trait = e.target.value;
    });
    document.getElementById("f-start").addEventListener("click", startResearch);

    // Active list actions (event delegation)
    document.getElementById("active-list").addEventListener("click", function (e) {
      var btn = e.target.closest("button[data-action]");
      if (!btn) return;
      var id = btn.dataset.id;
      if (btn.dataset.action === "complete") completeResearch(id, true);
      if (btn.dataset.action === "cancel") completeResearch(id, false);
    });

    // Matrix craft selector
    var mCraft = document.getElementById("m-craft");
    mCraft.innerHTML = ESO.CRAFTS.map(function (c) {
      return '<option value="' + c.id + '">' + c.name + "</option>";
    }).join("");
    mCraft.addEventListener("change", renderMatrix);

    // Matrix checkbox toggles (delegation)
    document.getElementById("matrix-wrap").addEventListener("change", function (e) {
      var cb = e.target;
      if (cb.type !== "checkbox") return;
      var key = traitKey(cb.dataset.craft, cb.dataset.item, cb.dataset.trait);
      if (cb.checked) {
        state.known[key] = true;
        // If it was being researched, that job is now resolved — drop it.
        state.active = state.active.filter(function (a) {
          return !(a.craft === cb.dataset.craft && a.item === cb.dataset.item && a.trait === cb.dataset.trait);
        });
        // A known trait can't be a research target — drop it from the plan.
        state.plan = state.plan.filter(function (p) {
          return !(p.craft === cb.dataset.craft && p.item === cb.dataset.item && p.trait === cb.dataset.trait);
        });
      } else {
        delete state.known[key];
      }
      save();
      renderMatrix();
      renderForm();
      renderActive();
      renderPlanForm();
      renderPlan();
    });

    // Research Plan controls
    document.getElementById("p-craft").addEventListener("change", function (e) {
      planForm.craft = e.target.value;
      planForm.item = null;
      planForm.trait = null;
      renderPlanForm();
    });
    document.getElementById("p-item").addEventListener("change", function (e) {
      planForm.item = e.target.value;
      planForm.trait = null;
      renderPlanForm();
    });
    document.getElementById("p-trait").addEventListener("change", function (e) {
      planForm.trait = e.target.value;
    });
    document.getElementById("p-add").addEventListener("click", function () { addTarget(false); });
    document.getElementById("p-add-all").addEventListener("click", function () { addTarget(true); });
    document.getElementById("p-clear").addEventListener("click", clearPlan);
    document.getElementById("p-targets").addEventListener("click", function (e) {
      var x = e.target.closest("button.chip-x");
      if (!x) return;
      removeTarget(x.dataset.craft, x.dataset.item, x.dataset.trait);
    });

    // Settings
    document.getElementById("passive-settings").addEventListener("change", function (e) {
      var sel = e.target.closest("select.passive-sel");
      if (!sel) return;
      state.settings.passive[sel.dataset.craft] = Number(sel.value);
      save();
      renderReductionSummary();
      renderForm();
      renderPlan();
    });
    document.getElementById("s-esoplus").addEventListener("change", function (e) {
      state.settings.esoPlus = e.target.checked;
      save();
      renderReductionSummary();
      renderForm();
      renderPlan();
    });
    document.getElementById("s-other").addEventListener("input", function (e) {
      state.settings.otherReduction = Number(e.target.value) || 0;
      save();
      renderReductionSummary();
      renderForm();
      renderPlan();
    });

    // Data management
    document.getElementById("s-export").addEventListener("click", exportData);
    document.getElementById("s-import").addEventListener("click", function () {
      document.getElementById("s-import-file").click();
    });
    document.getElementById("s-import-file").addEventListener("change", importData);
    document.getElementById("s-reset").addEventListener("click", resetData);
  }

  // ----- Import / export / reset ------------------------------------------
  function exportData() {
    var blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = "eso-crafting-helper-backup.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function importData(e) {
    var file = e.target.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function () {
      try {
        var data = JSON.parse(reader.result);
        state = {
          known: data.known || {},
          active: data.active || [],
          plan: data.plan || [],
          settings: Object.assign(clone(defaultState.settings), data.settings || {})
        };
        save();
        renderAll();
      } catch (err) {
        alert("Could not read that backup file.");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  function resetData() {
    if (!confirm("Clear all tracked traits, timers and settings? This cannot be undone.")) return;
    state = clone(defaultState);
    save();
    renderAll();
  }

  // ----- Boot -------------------------------------------------------------
  function renderAll() {
    renderForm();
    renderActive();
    renderMatrix();
    renderPlanForm();
    renderPlan();
    renderSettings();
    renderReference();
  }

  function boot() {
    wire();
    renderAll();
    // live countdown tick
    setInterval(function () {
      updateCountdowns();
    }, 1000);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
