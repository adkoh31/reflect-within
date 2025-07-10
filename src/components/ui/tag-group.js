"use client"

import { cva } from "class-variance-authority"
import {
  Tag as AriaTag,
  TagGroup as AriaTagGroup,
  TagList as AriaTagList,
  composeRenderProps,
  Text,
} from "react-aria-components"

import { cn } from "../../lib/utils"

import { Label } from "./field"

const TagGroup = AriaTagGroup

function TagList({
  className,
  ...props
}) {
  return (
    <AriaTagList
      className={composeRenderProps(className, (className) =>
        cn(
          "flex flex-wrap gap-2",
          /* Empty */
          "data-[empty]:text-sm data-[empty]:text-muted-foreground",
          className
        )
      )}
      {...props}
    />
  )
}

const badgeVariants = cva(
  [
    "inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium ring-offset-background transition-colors cursor-pointer",
    /* Focus */
    "data-[focused]:outline-none data-[focused]:ring-2 data-[focused]:ring-ring data-[focused]:ring-offset-2",
    /* Disabled */
    "data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50",
  ],
  {
    variants: {
      variant: {
        default: [
          "border-transparent bg-primary text-primary-foreground",
          /* Hover */
          "data-[hovered]:bg-primary/80",
        ],
        secondary: [
          "border-transparent bg-secondary text-secondary-foreground",
          /* Hover */
          "data-[hovered]:bg-secondary/80",
        ],
        destructive: [
          "border-transparent bg-destructive text-destructive-foreground",
          /* Hover */
          "data-[hovered]:bg-destructive/80",
        ],
        outline: "text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Tag({ children, className, ...props }) {
  let textValue = typeof children === "string" ? children : undefined
  return (
    <AriaTag
      textValue={textValue}
      className={composeRenderProps(className, (className, renderProps) =>
        cn(
          badgeVariants({
            variant:
              renderProps.selectionMode === "none" || renderProps.isSelected
                ? "default"
                : "secondary",
          }),
          className
        )
      )}
      {...props}
    >
      {children}
    </AriaTag>
  )
}

function JollyTagGroup({
  label,
  description,
  className,
  errorMessage,
  items,
  children,
  renderEmptyState,
  ...props
}) {
  return (
    <TagGroup className={cn("group flex flex-col gap-2", className)} {...props}>
      <Label>{label}</Label>
      <TagList items={items} renderEmptyState={renderEmptyState}>
        {children}
      </TagList>
      {description && (
        <Text className="text-sm text-muted-foreground" slot="description">
          {description}
        </Text>
      )}
      {errorMessage && (
        <Text className="text-sm text-destructive" slot="errorMessage">
          {errorMessage}
        </Text>
      )}
    </TagGroup>
  )
}

export { TagGroup, TagList, Tag, badgeVariants, JollyTagGroup } 