import { useRef, type KeyboardEvent } from 'react'

interface Tab {
  id: string
  label: string
}

interface Tabs98Props {
  tabs: Tab[]
  activeIndex: number
  onChange: (index: number) => void
  idPrefix: string
}

export default function Tabs98({ tabs, activeIndex, onChange, idPrefix }: Tabs98Props) {
  const refs = useRef<(HTMLButtonElement | null)[]>([])

  function handleKeyDown(e: KeyboardEvent<HTMLButtonElement>, index: number) {
    let next = index
    if (e.key === 'ArrowRight') next = (index + 1) % tabs.length
    else if (e.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length
    else if (e.key === 'Home') next = 0
    else if (e.key === 'End') next = tabs.length - 1
    else return
    e.preventDefault()
    onChange(next)
    refs.current[next]?.focus()
  }

  return (
    <div role="tablist" aria-label="how to play sections" className="flex gap-0.5 px-1">
      {tabs.map((tab, i) => {
        const active = i === activeIndex
        return (
          <button
            key={tab.id}
            ref={(el) => {
              refs.current[i] = el
            }}
            role="tab"
            id={`${idPrefix}-tab-${tab.id}`}
            aria-selected={active}
            aria-controls={`${idPrefix}-panel-${tab.id}`}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(i)}
            onKeyDown={(e) => handleKeyDown(e, i)}
            className={`font-bubbly text-xs sm:text-sm px-3 py-1.5 border-2 border-b-0 border-black
              ${active ? 'bg-win98-grey -mb-px z-10 shadow-[inset_1px_1px_0_#fff,-1px_0_0_#808080]' : 'bg-gray-400 mt-0.5 shadow-win98out'}
              rounded-t-sm relative`}
            style={active ? { height: 34 } : { height: 30 }}
          >
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}
