import { Box, Typography } from "@mui/material";
import * as DocBlock from "@storybook/blocks";
import { DocsContext, useOf } from "@storybook/blocks";
import { groupBy } from "lodash";
import { FC, useContext } from "react";

import { DesignStory } from "./base-style";

interface StoryGridProps {
  includePrimary?: boolean;
  cols?: number;
  cellClassName?: string;
  storyClassName?: string;
  title: string;
  reference?: string;
}

const DocsStory: FC<DocBlock.DocsStoryProps & { className?: string }> = ({
  of,
  expanded = true,
  withToolbar: withToolbarProp = false,
  __forceInitialArgs = false,
  __primary = false,
  className,
}) => {
  const { story } = useOf(of || "story", ["story"]);

  // use withToolbar from parameters or default to true in autodocs
  const withToolbar =
    story.parameters.docs?.canvas?.withToolbar ?? withToolbarProp;

  return (
    <>
      {expanded && (
        <>
          <div className="py-3">{story.name}</div>
        </>
      )}
      <DocBlock.Canvas
        of={of}
        withToolbar={withToolbar}
        story={{ __forceInitialArgs, __primary }}
        source={{ __forceInitialArgs }}
        className={className}
        layout="fullscreen"
        sourceState="none"
      />
    </>
  );
};

const StoryGridLayout = ({
  children,
  cols,
}: {
  children: React.ReactNode;
  cols: number;
}) => {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateRows: "repeat(auto-fit, minmax(0px, max-content))",
        gap: "1rem",
      }}
      style={{
        gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr)`,
      }}
    >
      {children}
    </Box>
  );
};

const titleCase = (str: string) => {
  return str.replace(
    /\w\S*/g,
    (txt) => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase()
  );
};

/**
 * Displays a grid containing all the stories for a component.
 * Use it with autodocs.
 *
 * /**
 * @example
 * const meta = {
 *   parameters: {
 *     layout: "centered",
 *     docs: {
 *       page: () => <StoriesOverview />,
 *     },
 *   },
 * }
 */
export const StoryGrid: FC<StoryGridProps> = ({
  includePrimary = true,
  cols = 3,
  cellClassName,
  storyClassName,
  title,
  reference,
}) => {
  const { componentStories, projectAnnotations, getStoryContext } =
    useContext(DocsContext);

  let stories = componentStories();
  const { stories: { filter } = { filter: undefined } } =
    projectAnnotations.parameters?.docs || {};
  if (filter) {
    stories = stories.filter((story) => filter(story, getStoryContext(story)));
  }
  // NOTE: this should be part of the default filter function. However, there is currently
  // no way to distinguish a Stories block in an autodocs page from Stories in an MDX file
  // making https://github.com/storybookjs/storybook/pull/26634 an unintentional breaking change.
  //
  // The new behavior here is that if NONE of the stories in the autodocs page are tagged
  // with 'autodocs', we show all stories. If ANY of the stories have autodocs then we use
  // the new behavior.
  const hasAutodocsTaggedStory = stories.some((story) =>
    story.tags?.includes("autodocs")
  );
  if (hasAutodocsTaggedStory) {
    // Don't show stories where mount is used in docs.
    // As the play function is not running in docs, and when mount is used, the mounting is happening in play itself.
    stories = stories.filter(
      (story) => story.tags?.includes("autodocs") && !story.usesMount
    );
  }

  if (!includePrimary) {
    stories = stories.slice(1);
  }

  const groups = groupBy(stories, (story) => {
    const groupTag = story.tags?.find((tag) => tag.startsWith("group:"));
    return groupTag ? groupTag.split(":")[1] : "default";
  });

  if (!stories || stories.length === 0) {
    return null;
  }

  const groupEntries = Object.entries(groups);
  return (
    <DesignStory title={title} reference={reference}>
      {groupEntries.map(([group, stories]) => (
        <Box
          sx={{
            "& + &": {
              marginTop: "2rem",
            },
          }}
          key={group}
        >
          {groupEntries.length > 1 ? (
            <Typography variant="h3" className="sb-unstyled">
              {titleCase(group)}
            </Typography>
          ) : null}
          <StoryGridLayout cols={cols} key={group}>
            {stories.map(
              (story) =>
                story && (
                  <Box
                    key={story.id}
                    sx={{
                      display: "grid",
                      gridTemplateRows: "subgrid",
                      gridRow: "span/3",
                      marginBottom: "2.5rem",
                    }}
                    className={cellClassName}
                  >
                    <DocsStory
                      of={story.moduleExport}
                      expanded
                      __forceInitialArgs
                      className={storyClassName}
                    />
                  </Box>
                )
            )}
          </StoryGridLayout>
        </Box>
      ))}
    </DesignStory>
  );
};
