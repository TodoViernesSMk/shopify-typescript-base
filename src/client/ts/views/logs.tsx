import * as React from "react";
import { AppliedFilter, Badge, Caption, Card, Filter, FilterType, FormLayout, Heading, Layout, Link, Modal, Page, Pagination, ResourceList, SkeletonBodyText, Stack, TextContainer, TextStyle } from "@shopify/polaris";

import { LogSchema } from "../../../shared/ts/shcema";
import { resource } from "../resource";
import { formatDate } from "../util";

export class LogsView extends React.Component<LogsView.Props, LogsView.State> {
  private meta: LogsView.Meta = {
    title: "Logs",
    filters: [{
      key: "type",
      label: "Log Type",
      operatorText: "is",
      type: FilterType.Select,
      options: ["info", "success", "warning"],
    }]
  };

  public state: LogsView.State = {
    item: LogSchema.empty(),
    items: [],
    loadingView: false,
    modalOpen: false,
    searchValue: "",
    appliedFilters: [],
    hasPaginationPrev: false,
    hasPaginationNext: false,
    currentPaginationPage: 0,
    firstPaginationPage: 0,
    lastPaginationPage: 0,
  };

  public async componentDidMount (): Promise<void> {
    // this.setState({ loadingView: true });
    // await new Promise(r => setTimeout(() => r(), 1000));
    // this.setState({ loadingView: false });

    resource.database.find.handler({ model: "log", query: { between: [new Date("2018-08-11"), new Date()] }})
      .then(response => this.setState({ items: response.data.items }))
      .catch(error => console.log("error", error))
  }

  public render (): JSX.Element {
    if(this.state.loadingView) {
      return this.skeleton();
    }

    const resourceName = {
      singular: "log",
      plural: "logs",
    };

    return (
      <Page
        title={this.meta.title}
        primaryAction={{ content: 'Settings', url: '/shopify/settings' }}
      >
        <Card>
          <ResourceList
            resourceName={resourceName}
            items={this.filter(this.state.items)}
            filterControl={this.resourceFilterControl()}
            renderItem={(item) => this.resourceListItem(item)}
          />
          {this.pagination()}
        </Card>
        {this.modalLogDetail()}
      </Page>
    );
  }

  private filter (items: LogSchema.Object[]): LogSchema.Object[] {
    return items.filter(item => {
      let matches = true;
      if(this.state.searchValue) {
        matches = Boolean(item.message.toLowerCase().match(this.state.searchValue.toLowerCase()))
      }
      return matches;
    });
  }

  private skeleton (): JSX.Element {
    return (
      <Page
        title={this.meta.title}
      >
        <Card sectioned>
          <TextContainer>
            <SkeletonBodyText />
          </TextContainer>
        </Card>
      </Page>
    );
  }

  private resourceFilterControl (): JSX.Element {
    return (
      <ResourceList.FilterControl
        filters={this.meta.filters}
        appliedFilters={this.state.appliedFilters}
        onFiltersChange={(appliedFilters) => this.setState({ appliedFilters: appliedFilters })}
        searchValue={this.state.searchValue}
        onSearchChange={(searchValue) => this.setState({ searchValue: searchValue })}
        additionalAction={{ content: "Search" }}
      />
    );
  }

  private resourceListItem (item: LogSchema.Object): JSX.Element {
    return (
      <ResourceList.Item
        accessibilityLabel={`View log details`}
        id={item.id}
        shortcutActions={[{
          content: "View Details",
          onAction: () => this.setState({ item: item, modalOpen: true })
        }]}
        onClick={() => this.setState({ item: item, modalOpen: true })}
        >
          <h3>
            <span style={{ paddingRight: "8px" }}>
              <Badge status={item.type}>&nbsp;</Badge>
            </span>
            <TextStyle variation="strong">{item.message}</TextStyle>
          </h3>
          <TextStyle variation="subdued">{formatDate(item.createdAt)}</TextStyle>
      </ResourceList.Item>
    );
  }

  private modalLogDetail (): JSX.Element {
    return (
      <Modal
        open={this.state.modalOpen}
        onClose={() => this.setState({ modalOpen: false })}
        title={<TextStyle variation="strong">Log Details</TextStyle>}
      >
        <Modal.Section>
          <TextContainer>
            <pre style={{
              border: "1px solid #dfe4e8",
              borderRadius: "3px",
              padding: "10px",
              backgroundColor: "rgba(223, 227, 232, .3)"
            }}>
              {JSON.stringify(this.state.item, null, 2)}
            </pre>
          </TextContainer>
        </Modal.Section>
      </Modal>
    );
  }

  private pagination (): JSX.Element {
    return (
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px 16px",
        borderTop: "1px solid #dfe4e8",
      }}>
        <Pagination
          hasPrevious={this.state.hasPaginationPrev}
          onPrevious={() => this.handlePaginationPrev()}
          hasNext={this.state.hasPaginationNext}
          onNext={() => this.handlePaginationNext()}
        />
      </div>
    );
  }

  private handlePaginationPrev (): void {
    this.handlePaginationGeneric(-1);
  }

  private handlePaginationNext (): void {
    this.handlePaginationGeneric(+1);
  }

  private handlePaginationGeneric (direction: number): void {
    this.setState((prevState) => {
      const currentPaginationPage = prevState.currentPaginationPage + direction;
      const hasPaginationPrev = currentPaginationPage > prevState.firstPaginationPage;
      const hasPaginationNext = currentPaginationPage < prevState.lastPaginationPage;
      return {
        ...prevState,
        currentPaginationPage,
        hasPaginationPrev,
        hasPaginationNext,
      }
    });
  }

}

export namespace LogsView {
  export type LogTypes = "info"|"success"|"error";
  export interface Meta {
    title: string;
    filters: Filter[];
  }
  export interface State {
    item: LogSchema.Object;
    items: LogSchema.Object[];
    loadingView: boolean;
    modalOpen: boolean;
    searchValue: string;
    appliedFilters: AppliedFilter[];
    hasPaginationPrev: boolean;
    hasPaginationNext: boolean;
    currentPaginationPage: number;
    firstPaginationPage: number;
    lastPaginationPage: number;
  }
  export interface Props {
    syncItem: null;
  }
}
