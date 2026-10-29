import {
  ConstrainedObjectModel,
  ConstrainedUnionModel,
  KotlinFileGenerator,
  RenderOutput,
} from '@asyncapi/modelina';

type KotlinFlags = {
  kotlinJackson?: boolean;
  packageName: string;
};

const JACKSON_IMPORT = 'com.fasterxml.jackson.annotation.*';

function modelParents(model: ConstrainedObjectModel): any[] {
  return [
    ...(model.options.parents || []),
    ...(model.options.extend || []),
  ].filter((parent, index, parents) =>
    parent?.name &&
    parents.findIndex((item) => item?.name === parent.name) === index,
  );
}

function renderInheritance(model: ConstrainedObjectModel): string {
  const parents = modelParents(model);
  if (!parents.length) {
    return '';
  }

  return ` : ${parents
    .map((parent) =>
      `${parent.name}${
        parent instanceof ConstrainedUnionModel || parent.options?.isExtended
          ? ''
          : '()'
      }`,
    )
    .join(', ')}`;
}

function renderJacksonProperties(model: ConstrainedObjectModel, content: string): string {
  const properties = Object.values(model.properties || {});
  let propertyIndex = 0;

  return content.replace(/(val\s+[^\n]+,)/g, (property) => {
    const currentProperty = properties[propertyIndex++];
    if (!currentProperty) {
      return property;
    }

    const annotation = `@get:JsonProperty("${currentProperty.unconstrainedPropertyName}")`;
    return `${annotation} ${property}`;
  });
}

function renderKotlinClass(args: any, jackson: boolean): string {
  const model = args.model as ConstrainedObjectModel;

  if (model.options.isExtended) {
    const properties = Object.values(model.properties || {})
      .map((property: any) => `val ${property.propertyName}: ${property.property.type}`)
      .join('\n');
    return `interface ${model.name}${properties ? ` {\n${args.renderer.indent(properties)}\n}` : ''}`;
  }

  let content = args.content;
  const inheritance = renderInheritance(model);
  if (inheritance) {
    content = content.includes(`data class ${model.name}(`)
      ? content.replace(/\n\)$/, `\n)${inheritance}`)
      : content.replace(`class ${model.name} {}`, `class ${model.name}${inheritance} {}`);
  }

  if (!jackson || !Object.keys(model.properties || {}).length) {
    return content;
  }

  args.renderer.dependencyManager.addDependency(JACKSON_IMPORT);
  return renderJacksonProperties(model, content);
}

function renderKotlinUnion(args: any, jackson: boolean): string {
  const model = args.model as ConstrainedUnionModel;
  const blocks: string[] = [];

  if (jackson) {
    args.renderer.dependencyManager.addDependency(JACKSON_IMPORT);
    const discriminator = model.options.discriminator;
    blocks.push(
      discriminator
        ? `@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, include = JsonTypeInfo.As.EXISTING_PROPERTY, property = "${discriminator.discriminator}", visible = true)`
        : '@JsonTypeInfo(use = JsonTypeInfo.Id.DEDUCTION)',
    );
    const types = model.union
      .filter((item: any) => item?.name)
      .map((item: any) => `    @JsonSubTypes.Type(${item.name}::class, name = "${item.name}")`)
      .join(',\n');
    blocks.push(`@JsonSubTypes(\n${types}\n)`);
  }

  blocks.push(`sealed interface ${model.name}`);
  return blocks.join('\n');
}

export function createKotlinFileGenerator(flags: KotlinFlags): KotlinFileGenerator {
  const jackson = flags.kotlinJackson === true;
  const fileGenerator = new KotlinFileGenerator({
    presets: [
      {
        class: {
          self: (args: any) => renderKotlinClass(args, jackson),
        },
      },
    ],
  } as any);

  const generator = fileGenerator as any;
  const render = generator.render.bind(generator);
  generator.render = (args: any) => {
    if (args.constrainedModel instanceof ConstrainedUnionModel) {
      const dependencyManager = args.options?.dependencyManager;
      return Promise.resolve(
        RenderOutput.toRenderOutput({
          result: renderKotlinUnion(
            { ...args, model: args.constrainedModel, renderer: { dependencyManager } },
            jackson,
          ),
          renderedName: args.constrainedModel.name,
          dependencies: dependencyManager?.dependencies || [],
        }),
      );
    }
    return render(args);
  };

  return fileGenerator;
}
