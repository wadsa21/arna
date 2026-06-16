"""
Генерация печатного HTML-отчёта по ребёнку (для врача/логопеда).

Возвращается как HTML — фронт открывает его в новой вкладке, откуда
пользователь печатает в PDF (Ctrl+P → Сохранить как PDF). Так мы даём
реальный экспорт без тяжёлых зависимостей; формат и стиль — печатные.
"""
import html
from datetime import date

MOOD_EMOJI = {1: "😣", 2: "🙁", 3: "😐", 4: "🙂", 5: "😄"}
LEVELS = {"LOW": "Начальный", "MEDIUM": "Средний", "HIGH": "Высокий"}


def _esc(v):
    return html.escape(str(v or ""))


def build_report_html(child) -> str:
    from apps.behavior.analysis import analyze_behavior
    from apps.schedule.models import ScheduleItem

    logs = list(child.behavior_logs.order_by("-date")[:30])
    insights = analyze_behavior(child, logs=logs) if logs else {}

    done_count = ScheduleItem.objects.filter(
        schedule__child=child, status=ScheduleItem.Status.DONE
    ).count()

    rows = "".join(
        f"""<tr>
          <td>{_esc(l.date)}</td>
          <td style="text-align:center;font-size:18px">{MOOD_EMOJI.get(l.mood, l.mood)}</td>
          <td>{_esc(l.positive_moments)}</td>
          <td>{_esc(l.triggers)}</td>
          <td>{_esc(l.notes)}</td>
        </tr>"""
        for l in logs
    ) or '<tr><td colspan="5" style="text-align:center;color:#888">Нет записей</td></tr>'

    recs = "".join(f"<li>{_esc(r)}</li>" for r in insights.get("recommendations", []))
    triggers = ", ".join(
        f"{_esc(t['text'])} ({t['count']}×)" for t in insights.get("common_triggers", [])
    ) or "—"

    return f"""<!doctype html>
<html lang="ru"><head><meta charset="utf-8">
<title>Отчёт — {_esc(child.name)}</title>
<style>
  * {{ box-sizing: border-box; }}
  body {{ font-family: -apple-system, Segoe UI, Roboto, Arial, sans-serif; color:#111; margin:0; padding:40px; background:#fff; }}
  .head {{ display:flex; justify-content:space-between; align-items:flex-start; border-bottom:3px solid #111; padding-bottom:16px; margin-bottom:24px; }}
  h1 {{ font-size:26px; margin:0; }}
  h2 {{ font-size:16px; margin:28px 0 10px; border-left:4px solid #111; padding-left:10px; }}
  .muted {{ color:#666; font-size:13px; }}
  .grid {{ display:grid; grid-template-columns:repeat(3,1fr); gap:12px; margin:12px 0; }}
  .stat {{ border:1px solid #ddd; border-radius:12px; padding:14px; }}
  .stat b {{ display:block; font-size:22px; }}
  table {{ width:100%; border-collapse:collapse; font-size:13px; }}
  th, td {{ border:1px solid #ddd; padding:8px; text-align:left; vertical-align:top; }}
  th {{ background:#f3f3f3; }}
  ul {{ padding-left:18px; }}
  .btn {{ background:#111; color:#fff; border:none; padding:10px 18px; border-radius:10px; cursor:pointer; font-weight:600; }}
  @media print {{ .btn {{ display:none; }} body {{ padding:0; }} }}
</style></head>
<body>
  <div class="head">
    <div>
      <h1>Отчёт о ребёнке</h1>
      <div class="muted">Арна · сформировано {date.today():%d.%m.%Y}</div>
    </div>
    <button class="btn" onclick="window.print()">Печать / PDF</button>
  </div>

  <h2>Профиль</h2>
  <div class="grid">
    <div class="stat"><span class="muted">Имя</span><b>{_esc(child.name)}</b></div>
    <div class="stat"><span class="muted">Возраст</span><b>{_esc(child.age) or "—"}</b></div>
    <div class="stat"><span class="muted">Коммуникация</span><b>{LEVELS.get(child.communication_level, "—")}</b></div>
  </div>
  {f'<p class="muted">Заметки: {_esc(child.notes)}</p>' if child.notes else ''}

  <h2>Сводка</h2>
  <div class="grid">
    <div class="stat"><span class="muted">Записей дневника</span><b>{insights.get("data_points", 0)}</b></div>
    <div class="stat"><span class="muted">Среднее настроение</span><b>{insights.get("average_mood", "—")}</b></div>
    <div class="stat"><span class="muted">Выполнено активностей</span><b>{done_count}</b></div>
  </div>
  <p class="muted">Частые триггеры: {triggers}</p>

  <h2>Рекомендации</h2>
  <ul>{recs or "<li>Недостаточно данных.</li>"}</ul>

  <h2>Дневник поведения (последние записи)</h2>
  <table>
    <thead><tr><th>Дата</th><th>Настроение</th><th>Позитив</th><th>Триггеры</th><th>Заметки</th></tr></thead>
    <tbody>{rows}</tbody>
  </table>
</body></html>"""
