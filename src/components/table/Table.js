import { ExelComponent } from '@core/ExelComponent'
import { createTable } from '@/components/table/table.tamplate'
import { resizeHandler } from '@/components/table/table.resize'
import { shouldResize, matrix } from '@/components/table/table.functions'
import { isCell } from '@/components/table/table.functions'
import { TableSelection } from '@/components/table/Table.selection'
import { $ } from '@core/dom'
import { nextSelector } from '@/components/table/table.functions'


export class Table extends ExelComponent {
   static className = 'excel__table'

   constructor($root, options) {
      super($root, {
         name: 'Table',
         listeners: ['mousedown', 'keydown', 'input'],
         ...options
      })
   }

   toHTML() {
      return createTable(20)
   }

   prepare() {
      this.selection = new TableSelection()
   }
   init() {
      super.init()
      const $cell = this.$root.find('[data-id="0:0"]')
      this.selectCell($cell)
      this.$on('formula:input', text => {
         this.selection.current.text(text)
      })
      this.$on('formula:done', () => {
         this.selection.current.focus()
      })
   }

   selectCell($cell) {
      this.selection.select($cell)
      this.$emit('table:select', $cell)
   }

   onMousedown(event) {
      if (shouldResize(event)) {
         resizeHandler(this.$root, event)
      } else if (isCell(event)) {
         const $target = $(event.target)
         if (event.shiftKey) {
            const $cells = matrix($target, this.selection.current)
               .map(id => this.$root.find(`[data-id="${id}"]`))
            this.selection.selectGroup($cells)
         } else {
            this.selection.select($target)
         }
      }
   }
   onKeydown(event) {
      const keys = [
         'Enter',
         'Tab',
         'ArrowRight',
         'ArrowLeft',
         'ArrowDown',
         'ArrowUp'
      ]
      const { key } = event
      if (keys.includes(key) && !event.shiftKey) {
         event.preventDefault();
         const id = this.selection.current.id(true)
         const $next = this.$root.find(nextSelector(key, id))
         this.selectCell($next)
      }
   }
   onInput(e) {
      this.$emit('table:input', $(e.target))
   }
}
