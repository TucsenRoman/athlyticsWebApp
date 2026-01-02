"use client"

import { createPortal } from "react-dom"
import { AvatarId } from "./avatars"
import { AVATAR_MAP } from "./avatarMap"

import { Ban, X } from "lucide-react"
import { GradientHint } from "@/components/ui"

/* -------------------------------------------------------------------------- */
/* TYPES                                                                      */
/* -------------------------------------------------------------------------- */

type Avatar = {
  id: AvatarId
  src: string
}

type Props = {
  open: boolean
  selected: AvatarId | null
  onSelect: (id: AvatarId | null) => void
  onClose: () => void
}

/* -------------------------------------------------------------------------- */
/* DATA                                                                       */
/* -------------------------------------------------------------------------- */

const AVATARS: Avatar[] = Object.entries(AVATAR_MAP).map(
  ([id, src]) => ({
    id: id as AvatarId,
    src,
  })
)

const SHUFFLED_AVATARS = shuffle(AVATARS)

/* -------------------------------------------------------------------------- */
/* UTILS                                                                      */
/* -------------------------------------------------------------------------- */

function shuffle<T>(items: T[]): T[] {
  const copy = [...items]

  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }

  return copy
}

/* -------------------------------------------------------------------------- */
/* COMPONENT                                                                  */
/* -------------------------------------------------------------------------- */

export default function AvatarSelector({
  open,
  selected,
  onSelect,
  onClose,
}: Props) {
  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-[var(--overlay-dk)]"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="
          relative z-10
          mx-2
          w-full min-w-[50px] max-w-[80vh]
          max-h-[80vh]
          rounded-xl
          border border-[var(--border)]
          bg-[var(--gray-2)]
          p-4
          shadow-lg
          flex flex-col
        "
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-[var(--border)]">
          <h3 className="text-sm font-semibold text-[var(--text-dk)]">
            Choose Avatar
          </h3>

          <button
            onClick={onClose}
            className="
              rounded-md p-1
              text-[var(--text)]
              hover:bg-[var(--gray-lt)]
            "
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Avatar Grid */}
        <div className="flex-1 overflow-y-auto pt-3">
          <div className="flex flex-wrap justify-around gap-3 pb-20">
            <div className="flex gap-3">
              {/* Clear Avatar */}
              <button
                key="clear-avatar"
                onClick={() => onSelect(null)}
                className={`
                  rounded-lg p-1 border transition
                  ${
                    selected === null
                      ? "border-[var(--dom-dk)] bg-[var(--dom-bg)]"
                      : "border-transparent hover:bg-[var(--gray-lt)]"
                  }
                `}
              >
                <div className="h-[140px] w-[140px] flex items-center justify-center">
                  <Ban className="h-[100px] w-[100px] text-[var(--text)]" />
                </div>
              </button>

              {/* Custom Avatar */}
              {/* <button
                key="custom-avatar"
                onClick={() => {
                }}
                className="
                  rounded-lg p-1 border transition
                  border-transparent hover:bg-[var(--gray-lt)]
                "
              >
                <div className="h-[150px] w-[150px] flex flex-col items-center justify-center gap-2">
                  <span className="text-xs font-medium text-[var(--text-muted)]">
                    Custom
                  </span>
                  <span className="text-4xl">+</span>
                </div>
              </button> */}
            </div>

            {SHUFFLED_AVATARS
            .filter(({ id }) => id === selected)
            .map(({ id, src }) => (
              <button
                key={id}
                onClick={() => onSelect(id)}
                className="
                  rounded-lg p-1 border transition
                  border-[var(--dom-dk)] bg-[var(--dom-bg)]
                "
              >
                <div className="h-[140px] w-[140px] rounded-full overflow-hidden bg-[var(--gray-lt)]">
                  <img
                    src={src}
                    alt=""
                    className="h-full w-full object-cover object-center"
                  />
                </div>
              </button>
            ))}

            {SHUFFLED_AVATARS
            .filter(({ id }) => id !== selected)
            .map(({ id, src }) => (
                <button
                key={id}
                onClick={() => onSelect(id)}
                className="
                    rounded-lg p-1 border transition
                    border-transparent hover:bg-[var(--gray-lt)]
                "
                >
                <div className="h-[140px] w-[140px] rounded-full overflow-hidden bg-[var(--gray-lt)]">
                    <img
                    src={src}
                    alt=""
                    className="h-full w-full object-cover object-center"
                    />
                </div>
                </button>
            ))}

            {/* <div>REQUEST NEW AVATAR</div> */}
          </div>
        </div>

        <GradientHint direction="bottom" extent="200px" radius="lg" />
      </div>
    </div>,
    document.getElementById("overlay-root")!
  )
}
