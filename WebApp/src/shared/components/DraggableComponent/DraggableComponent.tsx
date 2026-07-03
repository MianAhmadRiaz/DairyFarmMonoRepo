import { Box } from '@mui/material'
import React from 'react'
import { useDrag, useDrop } from 'react-dnd'

const ItemType = 'DRAGGABLE_COMPONENT'

interface Props {
  id: number;
  index: number;
  component: React.ReactElement;
  moveComponent: (dragIndex: number, hoverIndex: number) => void;
}

const DraggableComponent = ({ id, index, component, moveComponent }: Props) => {
  // Enable dragging for this component
  const [{ isDragging }, dragRef] = useDrag({
    type: ItemType,
    item: { id, index }, // Attach the id and index of the item being dragged
    collect: monitor => ({
      isDragging: monitor.isDragging() // Track drag state
    })
  })

  // Enable this component as a drop target
  const [, dropRef] = useDrop({
    accept: ItemType,
    hover: (draggedItem: any) => {
      if (draggedItem.index !== index) {
        moveComponent(draggedItem.index, index) // Rearrange items
        draggedItem.index = index
      }
    }
  })

  // Combine drag and drop references
  return (
    <Box
      ref={(node: any) => dragRef(dropRef(node))}
      sx={{
        opacity: isDragging ? 0.5 : 1, // Reduce opacity while dragging
        cursor: 'move', // Show a move cursor
        marginBottom: '20px', // Add spacing between components
        backgroundColor: 'background.paper', // Use theme background color
        boxShadow: 1, // Apply shadow
        borderRadius: 2, // Rounded corners
        padding: '16px' // Padding inside the component
      }}
    >
      {component}
    </Box>
  )
}

export default DraggableComponent
