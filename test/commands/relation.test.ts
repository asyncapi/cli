import {expect, test} from '@oclif/test';

const outputMermaid = 'graph TD\n server1[(mqtt://localhost:1883)]\nFlightSubscriberService[Flight Subscriber Service]\nFlightSubscriberService -- flight/queue --> server1\nFlightMonitorService[Flight Monitor Service]\nserver1 -- flight/queue --> FlightMonitorService\nFlightMonitorService -- flight/update --> server1\nFlightNotifierService[Flight Notifier Service]\nserver1 -- flight/update --> FlightNotifierService\n';
const outputPlantUML = '@startuml\ntitle Classes - Class Diagram\n\nclass server1 { \n url: mqtt://localhost:1883 \n protocol: mqtt\n}\nFlightMonitorService --|> server1:flight/update\nserver1 --|> FlightNotifierService:flight/update\nFlightSubscriberService --|> server1:flight/queue\nserver1 --|> FlightMonitorService:flight/queue\n@enduml\n';
const outputReactFlow = '[\n  {\n    id: \'Server1\',\n    data: { label: \'mqtt://localhost:1883,mqtt\' },\n    position: { x: 250, y: 5 }\n  },\n  {\n    id: \'FlightMonitorService\',\n    data: { label: \'Flight Monitor Service\' },\n    position: { x: 100, y: 10 }\n  },\n  {\n    id: \'edge1\',\n    source: \'FlightMonitorService\',\n    target: \'Server1\',\n    animated: true,\n    label: \'flight/update\',\n    type: \'edgeType\',\n    arrowHeadType: \'arrowclosed\'\n  },\n  {\n    id: \'FlightNotifierService\',\n    data: { label: \'Flight Notifier Service\' },\n    position: { x: 100, y: 10 }\n  },\n  {\n    id: \'edge2\',\n    source: \'Server1\',\n    target: \'FlightNotifierService\',\n    animated: true,\n    label: \'flight/update\',\n    type: \'edgeType\',\n    arrowHeadType: \'arrowclosed\'\n  },\n  {\n    id: \'FlightSubscriberService\',\n    data: { label: \'Flight Subscriber Service\' },\n    position: { x: 100, y: 10 }\n  },\n  {\n    id: \'edge3\',\n    source: \'FlightSubscriberService\',\n    target: \'Server1\',\n    animated: true,\n    label: \'flight/queue\',\n    type: \'edgeType\',\n    arrowHeadType: \'arrowclosed\'\n  },\n  {\n    id: \'edge4\',\n    source: \'Server1\',\n    target: \'FlightMonitorService\',\n    animated: true,\n    label: \'flight/queue\',\n    type: \'edgeType\',\n    arrowHeadType: \'arrowclosed\'\n  }\n]\n';

const defaultFilePaths = [
  './test/examples/flightService/monitor.yaml',
  './test/examples/flightService/notifier.yaml',
  './test/examples/flightService/subscriber.yaml',
];
describe('relation', () => {
  test
    .stderr()
    .stdout()
    .command([
      'relation',
      ...defaultFilePaths,
      '--type=mermaid'
    ])
    .it('works and logs correct output when mermaid syntax is provided', (ctx, done) => {
      expect(ctx.stdout).to.equal(outputMermaid);
      expect(ctx.stderr).to.equal('');
      done();
    });

  test
    .stderr()
    .stdout()
    .command([
      'relation',
      ...defaultFilePaths,
      '--type=plantUML'
    ])
    .it('works and logs correct output when plantUMl syntax is provided', (ctx, done) => {
      expect(ctx.stdout).to.equal(outputPlantUML);
      expect(ctx.stderr).to.equal('');
      done();
    });

  test
    .stderr()
    .stdout()
    .command([
      'relation',
      ...defaultFilePaths,
      '--type=reactFlow'
    ])
    .it('works and logs correct output when reactFlow syntax is provided', (ctx, done) => {
      expect(ctx.stdout).to.equal(outputReactFlow);
      expect(ctx.stderr).to.equal('');
      done();
    });

  test
    .stderr()
    .stdout()
    .command([
      'relation',
      './test/examples/flightService/monitor.yaml',
    ])
    .it('should not work on providing zero or one single contexts/filepaths', (ctx, done) => {
      expect(ctx.stdout).to.equal('');
      expect(ctx.stderr).to.equal('Error: Please provide more than one context/filepaths.\n');
      done();
    });
});
