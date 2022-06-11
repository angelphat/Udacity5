import dateFormat from 'dateformat'
import { History } from 'history'
import update from 'immutability-helper'
import * as React from 'react'
import {
  Button,
  Checkbox,
  Divider,
  Grid,
  Header,
  Icon,
  Input,
  Image,
  Loader
} from 'semantic-ui-react'

import { createIdol , deleteIdol, getIdols, patchIdol } from '../api/idols-api'
import Auth from '../auth/Auth'
import { Idol } from '../types/Idol';

interface IdolsProps {
  auth: Auth
  history: History
}

interface IdolsState {
  idols: Idol[]
  newIdolName: string
  loadingIdols: boolean
}

export class Idols extends React.PureComponent<IdolsProps, IdolsState> {
  state: IdolsState = {
    idols: [],
    newIdolName: '',
    loadingIdols: true
  }

  handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newIdolName: event.target.value })
  }

  onEditButtonClick = (idolId: string) => {
    this.props.history.push(`/idols/${idolId}/edit`)
  }

  onIdolCreate = async (event: React.ChangeEvent<HTMLButtonElement>) => {
    try {
      const dueDate = this.calculateDueDate()
      const newIdol = await createIdol(this.props.auth.getIdToken(), {
        name: this.state.newIdolName,
        dueDate
      })
      this.setState({
        idols: [...this.state.idols, newIdol],
        newIdolName: ''
      })
    } catch {
      alert('idol creation failed')
    }
  }

  onIdolDelete = async (idolId: string) => {
    try {
      await deleteIdol(this.props.auth.getIdToken(), idolId)
      this.setState({
        idols: this.state.idols.filter(idol => idol.idolId !== idolId)
      })
    } catch {
      alert('idol deletion failed')
    }
  }

  onIdolCheck = async (pos: number) => {
    try {
      const idol = this.state.idols[pos]
      await patchIdol(this.props.auth.getIdToken(), idol.idolId, {
        name: idol.name,
        dueDate: idol.dueDate,
        done: !idol.done
      })
      this.setState({
        idols: update(this.state.idols, {
          [pos]: { done: { $set: !idol.done } }
        })
      })
    } catch {
      alert('idol deletion failed')
    }
  }

  async componentDidMount() {
    try {
      const idols = await getIdols(this.props.auth.getIdToken())
      this.setState({
        idols,
        loadingIdols: false
      })
    } catch (e) {
      alert(`Failed to fetch idols: ${e.message}`)
    }
  }

  render() {
    return (
      <div>
        <Header as="h1">Idols</Header>

        {this.renderCreateIdolInput()}

        {this.renderIdols()}
      </div>
    )
  }

  renderCreateIdolInput() {
    return (
      <Grid.Row>
        <Grid.Column width={16}>
          <Input
            action={{
              color: 'teal',
              labelPosition: 'left',
              icon: 'add',
              content: 'New task',
              onClick: this.onIdolCreate
            }}
            fluid
            actionPosition="left"
            placeholder="To change the world..."
            onChange={this.handleNameChange}
          />
        </Grid.Column>
        <Grid.Column width={16}>
          <Divider />
        </Grid.Column>
      </Grid.Row>
    )
  }

  renderIdols() {
    if (this.state.loadingIdols) {
      return this.renderLoading()
    }

    return this.renderIdolsList()
  }

  renderLoading() {
    return (
      <Grid.Row>
        <Loader indeterminate active inline="centered">
          Loading Idols
        </Loader>
      </Grid.Row>
    )
  }

  renderIdolsList() {
    return (
      <Grid padded>
        {this.state.idols.map((idol, pos) => {
          return (
            <Grid.Row key={idol.idolId}>
              <Grid.Column width={1} verticalAlign="middle">
                <Checkbox
                  onChange={() => this.onIdolCheck(pos)}
                  checked={idol.done}
                />
              </Grid.Column>
              <Grid.Column width={10} verticalAlign="middle">
                {idol.name}
              </Grid.Column>
              <Grid.Column width={3} floated="right">
                {idol.dueDate}
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="blue"
                  onClick={() => this.onEditButtonClick(idol.idolId)}
                >
                  <Icon name="pencil" />
                </Button>
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="red"
                  onClick={() => this.onIdolDelete(idol.idolId)}
                >
                  <Icon name="delete" />
                </Button>
              </Grid.Column>
              {idol.attachmentUrl && (
                <Image src={idol.attachmentUrl} size="small" wrapped />
              )}
              <Grid.Column width={16}>
                <Divider />
              </Grid.Column>
            </Grid.Row>
          )
        })}
      </Grid>
    )
  }

  calculateDueDate(): string {
    const date = new Date()
    date.setDate(date.getDate() + 7)

    return dateFormat(date, 'yyyy-mm-dd') as string
  }
}
