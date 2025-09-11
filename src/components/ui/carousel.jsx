"use client"
import React from "react"
import useEmblaCarousel from "embla-carousel-react"
import { ArrowLeft, ArrowRight } from "lucide-react"

export default function Carousel({ children }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false })
  const [canPrev, setCanPrev] = React.useState(false)
  const [canNext, setCanNext] = React.useState(false)

  React.useEffect(() => {
    if (!emblaApi) return
    const checkScroll = () => {
      setCanPrev(emblaApi.canScrollPrev())
      setCanNext(emblaApi.canScrollNext())
    }
    emblaApi.on("select", checkScroll)
    emblaApi.on("reInit", checkScroll)
    checkScroll()
  }, [emblaApi])

  return (
    <div className="relative w-full">
      {/* Content */}
      <div ref={emblaRef} className="overflow-hidden">
        <div className="flex">{children}</div>
      </div>

      {/* Prev button */}
      <button
        onClick={() => emblaApi?.scrollPrev()}
        disabled={!canPrev}
        className="absolute -left-10 top-1/2 -translate-y-1/2 bg-white border rounded-full p-2 shadow"
      >
        <ArrowLeft className="h-4 w-4" />
      </button>

      {/* Next button */}
      <button
        onClick={() => emblaApi?.scrollNext()}
        disabled={!canNext}
        className="absolute -right-10 top-1/2 -translate-y-1/2 bg-white border rounded-full p-2 shadow"
      >
        <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  )
}

